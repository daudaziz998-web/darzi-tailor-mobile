package com.awaistailor.management

import android.app.DownloadManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.Settings
import androidx.core.content.FileProvider
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin
import java.io.File

/**
 * Native Android SDK Plugin written in Kotlin.
 * Handles native APK downloading, installation intents via FileProvider,
 * and Android 8+ unknown sources installation permission management.
 */
@CapacitorPlugin(name = "NativeUpdate")
class NativeUpdatePlugin : Plugin() {

    @PluginMethod
    fun getNativeAppInfo(call: PluginCall) {
        try {
            val pInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            val res = JSObject().apply {
                put("packageName", context.packageName)
                put("versionName", pInfo.versionName)
                put("versionCode", if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) pInfo.longVersionCode else pInfo.versionCode.toLong())
                put("sdkInt", Build.VERSION.SDK_INT)
                put("deviceModel", "${Build.MANUFACTURER} ${Build.MODEL}")
            }
            call.resolve(res)
        } catch (e: Exception) {
            call.reject("Failed to retrieve native app info", e)
        }
    }

    @PluginMethod
    fun canInstallUnknownApps(call: PluginCall) {
        val canInstall = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            context.packageManager.canRequestPackageInstalls()
        } else {
            true
        }
        val res = JSObject().apply {
            put("canInstall", canInstall)
        }
        call.resolve(res)
    }

    @PluginMethod
    fun openInstallPermissionSettings(call: PluginCall) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                    data = Uri.parse("package:${context.packageName}")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
                call.resolve()
            } else {
                call.resolve()
            }
        } catch (e: Exception) {
            call.reject("Could not open unknown sources settings", e)
        }
    }

    @PluginMethod
    fun installApkFile(call: PluginCall) {
        val filePath = call.getString("filePath")
        if (filePath.isNullOrBlank()) {
            call.reject("Missing 'filePath' parameter")
            return
        }

        try {
            val file = File(filePath)
            if (!file.exists()) {
                call.reject("APK file not found at: $filePath")
                return
            }

            // Verify unknown package install permission on Android 8+
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O && !context.packageManager.canRequestPackageInstalls()) {
                val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                    data = Uri.parse("package:${context.packageName}")
                    addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                }
                context.startActivity(intent)
                call.reject("Install permission required. Requested permission screen.")
                return
            }

            // Generate content URI through FileProvider
            val authority = "${context.packageName}.fileprovider"
            val contentUri: Uri = FileProvider.getUriForFile(context, authority, file)

            val installIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(contentUri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            context.startActivity(installIntent)
            call.resolve(JSObject().apply { put("success", true) })
        } catch (e: Exception) {
            call.reject("Error launching APK installer: ${e.message}", e)
        }
    }

    @PluginMethod
    fun downloadAndInstallApk(call: PluginCall) {
        val url = call.getString("url")
        val fileName = call.getString("fileName") ?: "darzi-update.apk"

        if (url.isNullOrBlank()) {
            call.reject("Missing APK download URL")
            return
        }

        try {
            val destinationFile = File(
                context.getExternalFilesDir(Environment.DIRECTORY_DOWNLOADS),
                fileName
            )

            // Remove existing old file if present
            if (destinationFile.exists()) {
                destinationFile.delete()
            }

            val request = DownloadManager.Request(Uri.parse(url)).apply {
                setTitle("Downloading Darzi Master Update")
                setDescription("New version update")
                setNotificationVisibility(DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED)
                setDestinationUri(Uri.fromFile(destinationFile))
                setMimeType("application/vnd.android.package-archive")
            }

            val downloadManager = context.getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager
            val downloadId = downloadManager.enqueue(request)

            // Listen for download completion via BroadcastReceiver
            val onCompleteReceiver = object : BroadcastReceiver() {
                override fun onReceive(ctxt: Context?, intent: Intent?) {
                    val id = intent?.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1) ?: -1
                    if (id == downloadId) {
                        try {
                            ctxt?.unregisterReceiver(this)
                        } catch (_: Exception) {}

                        // Launch installer automatically once downloaded
                        if (destinationFile.exists()) {
                            val authority = "${context.packageName}.fileprovider"
                            val contentUri = FileProvider.getUriForFile(context, authority, destinationFile)
                            val installIntent = Intent(Intent.ACTION_VIEW).apply {
                                setDataAndType(contentUri, "application/vnd.android.package-archive")
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                            }
                            context.startActivity(installIntent)
                        }
                    }
                }
            }

            val filter = IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                context.registerReceiver(onCompleteReceiver, filter, Context.RECEIVER_EXPORTED)
            } else {
                context.registerReceiver(onCompleteReceiver, filter)
            }

            call.resolve(JSObject().apply {
                put("downloadId", downloadId)
                put("targetPath", destinationFile.absolutePath)
                put("status", "enqueued")
            })
        } catch (e: Exception) {
            call.reject("Failed to start native Android download: ${e.message}", e)
        }
    }
}
