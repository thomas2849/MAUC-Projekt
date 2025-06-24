plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    -    alias(libs.plugins.kotlin.compose)
}

android {
    namespace = "com.example.myapplication"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.myapplication"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }

    -    buildFeatures {
        -        compose = true
        -    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation("org.eclipse.paho:org.eclipse.paho.android.service:1.1.1")
    implementation("org.eclipse.paho:org.eclipse.paho.client.mqttv3:1.2.5")
    implementation("com.google.code.gson:gson:2.10")

    +    // enable XML layouts and AppCompatActivity, LayoutInflater, etc.
    +    implementation("androidx.appcompat:appcompat:1.6.1")
    +    // Core KTX is already here, but make sure:
    implementation(libs.androidx.core.ktx)
}