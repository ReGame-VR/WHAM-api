//
//  ProgressViewController.swift
//  VR_Monitoring
//
//  Created by Sarada Symonds on 3/16/16.
//  Copyright (c) 2016 NU Enabling Engineering. All rights reserved.
//

import UIKit
import ResearchKit
class ProgressViewController: UIViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        let firstViewController:UIViewController = self
        // The following statement is what you need
        self.view.backgroundColor = UIColor(patternImage: UIImage(named: "bg2.png")!)
        let customTabBarItem:UITabBarItem = UITabBarItem(title: nil, image: UIImage(named: "Bar Chart Filled-35.png")?.imageWithRenderingMode(UIImageRenderingMode.AlwaysOriginal), selectedImage: UIImage(named: "Bar Chart Filled-35.png"))
        firstViewController.tabBarItem = customTabBarItem
        customTabBarItem.imageInsets.top = 10
        customTabBarItem.imageInsets.bottom = -6
        scoreLabel.text = String(GlobalVariables.sharedManager.totalScore)
        scoreLabel.textAlignment = .Center
        Timeduration.text = GlobalVariables.sharedManager.timeDuration
        bpm.text = String(GlobalVariables.sharedManager.hearrate) + " BPM"
        if (GlobalVariables.sharedManager.totalScore < 400){
            message.text = "You are not trying hard enough"
              message.textAlignment = .Center
        }
        else if ((GlobalVariables.sharedManager.totalScore < 1000 )&&(GlobalVariables.sharedManager.totalScore > 400)){
            message.text = "Good Effort"
             message.textAlignment = .Center
        }
        else {
            message.text = "Congratulations! You did great!"
             message.textAlignment = .Center
        }
        
        // Do any additional setup after loading the view.
    }
    @IBOutlet var bpm: UILabel!
    @IBOutlet var Timeduration: UILabel!
    @IBOutlet var scoreLabel: UILabel!
    @IBOutlet var message: UILabel!
    override func viewDidAppear(animated: Bool) {
        print("view did appear")
//        let firstViewController:UIViewController = self
//        // The following statement is what you need
//        let customTabBarItem:UITabBarItem = UITabBarItem(title: nil, image: UIImage(named: "Bar Chart Filled-35.png")?.imageWithRenderingMode(UIImageRenderingMode.AlwaysOriginal), selectedImage: UIImage(named: "Bar Chart Filled-35.png"))
//        firstViewController.tabBarItem = customTabBarItem
//        customTabBarItem.imageInsets.top = 10
//        customTabBarItem.imageInsets.bottom = -6
        
        print("here is your progress")
        print(GlobalVariables.sharedManager.totalScore)

    }
    override func viewWillAppear(animated: Bool) {
      
        

    }
}
