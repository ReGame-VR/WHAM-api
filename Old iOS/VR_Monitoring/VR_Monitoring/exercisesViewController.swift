//
//  exercisesViewController.swift
//  VR_Monitoring
//
//  Created by Sarada Symonds on 12/9/15.
//  Copyright (c) 2015 NU Enabling Engineering. All rights reserved.
//

import UIKit

class exercisesViewController: UITableViewController {

    var userName = String()

    override func viewDidLoad() {
        super.viewDidLoad()
        let firstViewController:UITableViewController = self
        // The following statement is what you need
        let customTabBarItem:UITabBarItem = UITabBarItem(title: nil, image: UIImage(named: "Running-35.png")?.imageWithRenderingMode(UIImageRenderingMode.AlwaysOriginal), selectedImage: UIImage(named: "Running-35.png"))
        firstViewController.tabBarItem = customTabBarItem
        customTabBarItem.imageInsets.top = 6
        customTabBarItem.imageInsets.bottom = -6
        
        // Do any additional setup after loading the view.
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    let exerciseList = ["River Rush", "20,000 Leaks", "Rally Ball", "Reflex Ridge", "Space Pop"]
    override func tableView(tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        return exerciseList.count
    }
    
    override func tableView(tableView: UITableView, cellForRowAtIndexPath indexPath: NSIndexPath) -> UITableViewCell {
        // Table view cells are reused and should be dequeued using a cell identifier.
        let cellIdentifier = "myCell"
        let cell = tableView.dequeueReusableCellWithIdentifier(cellIdentifier, forIndexPath: indexPath) as! exerciseTableViewCell
        
        // Fetches the appropriate meal for the data source layout.
        cell.exerciseTitle!.text = exerciseList[indexPath.row]
        
        
        return cell
    }
    override func tableView(tableView: UITableView, didSelectRowAtIndexPath indexPath: NSIndexPath) {
        self.performSegueWithIdentifier("toExerciseTimer", sender: self)
    }
    
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        let TimerViewController: timerViewController = segue.destinationViewController as! timerViewController
        TimerViewController.userName = userName
        let indexPath = tableView.indexPathForSelectedRow
        TimerViewController.exerciseTitle = exerciseList[indexPath!.row]
        
    }
    
    /*
    // MARK: - Navigation

    // In a storyboard-based application, you will often want to do a little preparation before navigation
    override func prepareForSegue(segue: UIStoryboardSegue, sender: AnyObject?) {
        // Get the new view controller using segue.destinationViewController.
        // Pass the selected object to the new view controller.
    }
    */

}
