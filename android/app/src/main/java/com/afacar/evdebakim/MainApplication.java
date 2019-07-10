package com.afacar.evdebakim;

import android.app.Application;
import com.google.firebase.database.FirebaseDatabase; // -> for setPersistenceEnabled(true)
import com.facebook.react.ReactApplication;
import com.reactnativecommunity.slider.ReactSliderPackage;
import com.zmxv.RNSound.RNSoundPackage;
import com.rnim.rn.audio.ReactNativeAudioPackage;
import com.imagepicker.ImagePickerPackage;
import co.apptailor.googlesignin.RNGoogleSigninPackage;
import com.horcrux.svg.SvgPackage;
import com.wenkesj.voice.VoicePackage;
import com.swmansion.gesturehandler.react.RNGestureHandlerPackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.facebook.CallbackManager;
import com.facebook.reactnative.androidsdk.FBSDKPackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.auth.RNFirebaseAuthPackage; // <-- Add this line
import io.invertase.firebase.functions.RNFirebaseFunctionsPackage; // <-- Add this line
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage; // <-- Add this line
import io.invertase.firebase.database.RNFirebaseDatabasePackage; // <-- Add this line
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage; // <-- Add this line
import io.invertase.firebase.storage.RNFirebaseStoragePackage; // <-- Add this line

import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private static CallbackManager mCallbackManager = CallbackManager.Factory.create();

  protected static CallbackManager getCallbackManager() {
    return mCallbackManager;
  }

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new ReactSliderPackage(),
            new RNSoundPackage(),
            new ReactNativeAudioPackage(),
            new ImagePickerPackage(),
            new RNGoogleSigninPackage(),
            new SvgPackage(),
            new VoicePackage(),
            new RNGestureHandlerPackage(),
            new VectorIconsPackage(),
            new FBSDKPackage(mCallbackManager),
            new RNFirebasePackage(),
            new RNFirebaseAuthPackage(), // <-- Add this line
            new RNFirebaseFunctionsPackage(), // <-- Add this line
            new RNFirebaseMessagingPackage(), // <-- Add this line
            new RNFirebaseDatabasePackage(), // <-- Add this line
            new RNFirebaseNotificationsPackage(), // <-- Add this line
            new RNFirebaseStoragePackage() // <-- Add this line
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    // TODO: For setPersistenceEnabled on IOS => https://rnfirebase.io/docs/v5.x.x/core/default-app 
    FirebaseDatabase.getInstance().setPersistenceEnabled(true);
  }
}
