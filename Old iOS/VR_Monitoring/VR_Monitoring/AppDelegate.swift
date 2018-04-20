//
//  AppDelegate.swift
//  VR_Monitoring
//
//  Created by Sarada Symonds on 11/7/15.
//  Copyright (c) 2015 NU Enabling Engineering. All rights reserved.
//

import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?
    func application(application: UIApplication, didFinishLaunchingWithOptions launchOptions: [NSObject: AnyObject]?) ->
        Bool {
        UIApplication.sharedApplication().setStatusBarStyle(UIStatusBarStyle.LightContent, animated: true)
        let mytabBarColor = UIColor(
            red: 0.03,
            green: 0.8,
            blue: 0.86,
            alpha: 1.0)
        let itemsColor = UIColor(
            red: 0.09,
            green: 0.69,
            blue: 0.89,
            alpha: 1.0)
        let selecteditemsColor = UIColor(
            red: 0.64,
            green: 0.88,
            blue: 0.96,
            alpha: 1.0)
        UINavigationBar.appearance().barTintColor = mytabBarColor
        UINavigationBar.appearance().tintColor = UIColor.whiteColor()
        UINavigationBar.appearance().titleTextAttributes = [NSForegroundColorAttributeName: UIColor.whiteColor()]
        UINavigationBar.appearance().translucent = false
        UITabBar.appearance().barTintColor = mytabBarColor
        //UITabBar.appearance().tintColor = UIColor.whiteColor()
        UITabBar.appearance().translucent = false
        //UIBarButtonItem.appearance().tintColor = UIColor.whiteColor()
        /*UIApplication.sharedApplication().statusBarHidden = false
        UIApplication.sharedApplication().statusBarStyle = UIStatusBarStyle.LightContent*/
        let addStatusBar = UIView()
        self.window?.rootViewController?.view .addSubview(addStatusBar)
        
        
        return true
    }

    func applicationWillResignActive(application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and throttle down OpenGL ES frame rates. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(application: UIApplication) {
        // Called as part of the transition from the background to the inactive state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }


}

