package com.awaistailor.management

import android.os.Bundle
import android.os.Build
import android.view.WindowManager
import androidx.core.view.WindowCompat
import com.getcapacitor.BridgeActivity

/**
 * Native Android MainActivity written in Kotlin.
 * Serves as the entry point for the Darzi Master (Awais Tailor House) Android App.
 */
class MainActivity : BridgeActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        // Register custom native Kotlin plugins with Capacitor bridge
        registerPlugin(NativeUpdatePlugin::class.java)
        registerPlugin(NativeTailorPlugin::class.java)

        super.onCreate(savedInstanceState)

        // Android SDK window styling and edge-to-edge layout
        setupNativeWindow()
    }

    private fun setupNativeWindow() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            window.attributes.layoutInDisplayCutoutMode =
                WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES
        }
        WindowCompat.setDecorFitsSystemWindows(window, true)
    }
}
