package com.evdebakim;

import android.app.Application;

import com.facebook.react.ReactApplication;
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

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
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
  }
}
