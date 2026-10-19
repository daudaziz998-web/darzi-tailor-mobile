package com.awaistailor.management

import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import com.getcapacitor.JSObject
import com.getcapacitor.Plugin
import com.getcapacitor.PluginCall
import com.getcapacitor.PluginMethod
import com.getcapacitor.annotation.CapacitorPlugin

/**
 * Native Android SDK Plugin written in Kotlin.
 * Provides native Android capabilities for tailoring features:
 * - Native Android Share Intent (for sharing measurement slips to WhatsApp/SMS/Email)
 * - Native Android Haptic feedback for measurement entry
 * - Native Android device specifications
 */
@CapacitorPlugin(name = "NativeTailor")
class NativeTailorPlugin : Plugin() {

    @PluginMethod
    fun shareReceiptText(call: PluginCall) {
        val title = call.getString("title") ?: "Tailoring Measurement Slip"
        val text = call.getString("text")

        if (text.isNullOrBlank()) {
            call.reject("Missing text content to share")
            return
        }

        try {
            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_SUBJECT, title)
                putExtra(Intent.EXTRA_TEXT, text)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            val chooser = Intent.createChooser(shareIntent, title).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(chooser)
            call.resolve(JSObject().apply { put("success", true) })
        } catch (e: Exception) {
            call.reject("Failed to open Android share dialog", e)
        }
    }

    @PluginMethod
    fun triggerHapticFeedback(call: PluginCall) {
        try {
            val type = call.getString("type") ?: "light"
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager
                val vibrator = vibratorManager.defaultVibrator
                val effect = when (type) {
                    "heavy" -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_HEAVY_CLICK)
                    "click" -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_CLICK)
                    else -> VibrationEffect.createPredefined(VibrationEffect.EFFECT_TICK)
                }
                vibrator.vibrate(effect)
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                    vibrator.vibrate(VibrationEffect.createOneShot(30, VibrationEffect.DEFAULT_AMPLITUDE))
                } else {
                    @Suppress("DEPRECATION")
                    vibrator.vibrate(30)
                }
            }
            call.resolve()
        } catch (_: Exception) {
            // Haptics are optional; safe fallback
            call.resolve()
        }
    }

    @PluginMethod
    fun calculateClothEstimate(call: PluginCall) {
        // Kotlin implementation of traditional tailor cutting estimates
        val totalLength = call.getDouble("totalLength") ?: 0.0
        val sleeveLength = call.getDouble("sleeveLength") ?: 0.0
        val chest = call.getDouble("chest") ?: 0.0
        val isDoubleArz = call.getBoolean("doubleArz") ?: true

        // Standard formula used in Pakistani/Indian subcontinent tailoring:
        // Kameez Shalwar requires approximately 4 meters on single arz (bada arz ~4.5 yards/4m, small arz ~7m)
        val estimatedMeters = if (isDoubleArz) {
            val base = (totalLength * 2 + sleeveLength + 8.0) / 39.37
            Math.max(3.5, Math.min(5.5, base))
        } else {
            val base = (totalLength * 4 + sleeveLength * 2 + 12.0) / 39.37
            Math.max(6.5, Math.min(8.5, base))
        }

        val res = JSObject().apply {
            put("estimatedMeters", Math.round(estimatedMeters * 100.0) / 100.0)
            put("estimatedGuz", Math.round(estimatedMeters * 1.09361 * 100.0) / 100.0)
        }
        call.resolve(res)
    }
}
