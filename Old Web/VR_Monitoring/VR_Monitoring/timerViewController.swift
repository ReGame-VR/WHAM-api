//
//  timerViewController.swift/Users/quan199555/Desktop/iTerm.app
//  VR_Monitoring
//
//  Created by Sarada Symonds on 12/9/15.
//  Copyright (c) 2015 NU Enabling Engineering. All rights reserved.
//

import UIKit
import Firebase
import CoreBluetooth
import ResearchKit
import PKHUD

class timerViewController: UIViewController, CBCentralManagerDelegate, CBPeripheralDelegate {
    @IBOutlet var scoreoutout: UILabel!
    

    var userName = String()
    var exerciseTitle = String()
    @IBOutlet weak var timeLabel: UILabel!
    @IBOutlet weak var startButton: UIButton!
    var running = false;
    var score = 0;
    var totalscore = 0.0;
    var numberofdata = 0;
    var temp1 = 0;
    var temp2 = 0;
    var startstate = 0;
    var HR = 60;
    
    @IBOutlet weak var statusLabel: UILabel!
    @IBOutlet weak var exerciseTitleLabel: UILabel!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        exerciseTitleLabel.text = exerciseTitle
        self.view.backgroundColor = UIColor(patternImage: UIImage(named: "bg2.png")!)
        // Initialize central manager on load
        centralManager = CBCentralManager(delegate: self, queue: nil)
        // Do any additional setup after loading the view.
    }

    @IBAction func startButton(sender: UIButton) {
        launchBool = !launchBool
        if (startstate == 2){
        tabBarController?.selectedIndex = 1;
        }
    }
    var launchBool: Bool = false {
        didSet {
            peripheralDevice.discoverServices(nil);//discover bluetooth device
            if launchBool == true { //if start
                startButton.setTitle("Stop", forState: .Normal)
                let aSelector : Selector = "updateTime"
                timer = NSTimer.scheduledTimerWithTimeInterval(0.01, target: self, selector: aSelector, userInfo: nil, repeats: true)
                startTime = NSDate.timeIntervalSinceReferenceDate()
                startstate = 1
            } else {
                timer.invalidate()
                userName = GlobalVariables.sharedManager.ID
                print(userName)
                var currentTime = timeLabel.text!
                var newurl = "https://amber-inferno-7571.firebaseio.com/userlist/" +  (userName) + "/" as String
                
                var ref = Firebase(url: "https://amber-inferno-7571.firebaseio.com/")
                var ref2 = Firebase(url: newurl)
                print(ref2)
                var name = exerciseTitle
                let date = NSDate()
            
                let cal = NSCalendar(calendarIdentifier: NSCalendarIdentifierGregorian)
                let components = cal!.components([.Day, .Month, .Year], fromDate: date)
                let year =  components.year
                let month = components.month
                let day = components.day
                let today = month.description + "/" + day.description + "/" + year.description
                let duration = timeLabel.text!
                let dataset = totalscore
                
                //look for the user in database
                
                //is a new user? no, add a new user with the new exercise
              
                
                ref2.observeSingleEventOfType(.Value, withBlock: { snapshot in
                    if (snapshot.value is NSNull){
                        print("Not FOund")
                       // var username = userName //get it from somewhere
                        //  var exerciseName = "River Rush" //get it from somewhere
                        let feedback = "8"
                        
                        var occurance = ["dataset":dataset, "date":today, "duration":duration, "feedback": feedback]
                        var occuranceParent = ["first entry": occurance]
                        
                        var exercises = ["name":name, "occurance":occuranceParent]
                        var exercisesParent = [name : exercises]
                        var user = ["id":self.userName, "name":self.userName, "exercises":exercisesParent]
                        var userParent = [self.userName:user]
                        var usersRef = ref.childByAppendingPath("userlist")
                        usersRef.updateChildValues(userParent as [NSObject : AnyObject])
                    }
                    else {
                        print ("FOund")
                        print("what?????")
                        var refuser = Firebase(url: "https://amber-inferno-7571.firebaseio.com/userlist/" + (self.userName) + "/exercises/" + (name) + "/")
                        refuser.observeSingleEventOfType(.Value, withBlock: { snapshot in
                            if (snapshot.value is NSNull){
                                print("ex  not Founf")
                            var refex = Firebase(url: "https://amber-inferno-7571.firebaseio.com/userlist/" + (self.userName) + "/")
                                
                                let feedback = "8"
                                var occurance = ["dataset":dataset, "date":today, "duration":duration, "feedback": feedback]
                                var occuranceParent = ["first entry": occurance]
                                var exercises = ["name":name, "occurance":occuranceParent]
                                var exercisesParent = [name : exercises]
                                
                                
                                //var user = ["id":self.userName, "name":self.userName, "exercises":exercisesParent]
                                //var userParent = [self.userName:user]
                                var refex1 = refex.childByAppendingPath("exercises")
                                refex1.updateChildValues(exercisesParent as [NSObject : AnyObject])
                            }
                                else {
                                print ("ex foudn")
                                //append a new occurance
                                
                                
                                var refoccur = Firebase(url: "https://amber-inferno-7571.firebaseio.com/userlist/" + (self.userName) + "/exercises/" + (name) + "/occurance"+"/")

                                let feedback = "8"
                                var occurance = ["dataset":dataset, "date":today, "duration":duration, "feedback": feedback]
                                
                                 var occLocation = refoccur.childByAutoId()
                                occLocation.setValue(occurance)
                                
                               // var occuranceParent = ["first entry2": occurance]

                                
                                }
                            }, withCancelBlock: { error in
                                print(error.description)
                                
                        })
                          
                    }
                    //print(snapshot.value)
                    
                    }, withCancelBlock: { error in
                        print(error.description)
                        
                })
                
               /* ref.queryOrderedByChild(userName).observeEventType(.ChildAdded, withBlock: { snapshot in
                    if let height = snapshot.value[self.userName] as? String {
                        print("\(snapshot.key) was \(height) meters tall")
                    }
                })
                */
                
//                var username = "Bhumitra" //get it from somewhere
//              //  var exerciseName = "River Rush" //get it from somewhere
//                let feedback = "8"
//               
//                var occurance = ["dataset":dataset, "date":today, "duration":duration, "feedback": feedback]
//                var occuranceParent = ["first entry2": occurance]
//                
//                var exercises = ["name":name, "occurance":occuranceParent]
//                var exercisesParent = [name : exercises]
//                var user = ["id":userName, "name":userName, "exercises":exercisesParent]
//                var userParent = [username:user]
//                var usersRef = ref.childByAppendingPath("userlist")
//                usersRef.updateChildValues(userParent as [NSObject : AnyObject])
                
            //    var usersRef1 =Firebase(url: "https://amber-inferno-7571.firebaseio.com/Bhumitra/exercises")
             //   usersRef1.observeEventType(.Value, andPreviousSiblingKeyWithBlock: <#T##((FDataSnapshot!, String!) -> Void)!##((FDataSnapshot!, String!) -> Void)!##(FDataSnapshot!, String!) -> Void#>)
                
            /*
                var currentTime = timeLabel.text!
                var ref = Firebase(url: "https://amber-inferno-7571.firebaseio.com/")
                
                
                /**
                 * Note: the occurance, exercise, and user are all within a list. So we need to add a specific instance
                 * i.e. occurance0, exercise0 and user0. 
                 * This will have to be improved later on to find the correct item in the list to append to OR to add a new user.
                 * Decision Tree:
                    Is it a new user?
                        -Yes
                            Append a new user
                        -No
                            Find the current user
                            Is it a new exercise?
                                -Yes
                                    Append a new exercise
                                -No
                                    Find the current exercise and append this occurance.
                 */
           /*   var name = "riverraft"
                var occurance = ["dataset":"100", "date":"26/3", "duration":"1", "feedback":"great"]
                var occurance0 = [occurance]
                var exercise = ["name":name, "occurance":occurance0]
                var exercise0 = [exercise]
                var id = "ben"
                var nameuser = "Ben";
                var user = ["name":nameuser, "exercise":exercise0, "id":id];
                var user2 = ["user":user];
                var usersRef = ref.childByAppendingPath("userlist")
                usersRef.updateChildValues(user2)
             */
                
                
                
                /*
                 * By auto id on all list items
                 */
                var usersRef = ref.childByAppendingPath("userlist")
                var nameuser = "Ben";
                var id = "ben"
                var user = ["name":nameuser, "id":id];
                var userLocation = usersRef.childByAutoId()
                userLocation.setValue(user)
              //  var occurance = ["dataset":"100", "date":"26/3", "duration":"1", "feedback":"great"]
               // var occurance0 = [occurance]
                var exercise = ["name":"RiverRaft"]
                
                
              //  var husky = ["user_name": "Husky", "time": currentTime]
                
              //  var usersRef = ref.childByAppendingPath("users")
                
              //  var users = ["husky": husky]
             //   usersRef.setValue(users)
*/
                startstate = 2
                startButton.setTitle("Start", forState: .Normal)
             //   writeString("Stop") //would this work to stop data stream?
                print("THE USER SCORE IS ")
                print(totalscore) //this is the FINAL SCORE of HOW THE USER PERFORM IN THE EXERCISE!!!
                print("heart rate")
                print(HR)
                GlobalVariables.sharedManager.totalScore = totalscore
                GlobalVariables.sharedManager.hearrate = HR
                GlobalVariables.sharedManager.timeDuration = duration
                //SEND THIS TO THE DATABASE AND DONE!!!!!
             let taskViewController = ORKTaskViewController(task: SurveyTask, taskRunUUID: nil)
                taskViewController.delegate = self
                presentViewController(taskViewController, animated: true, completion: nil)
        
             
                              //  let thirdViewController = self.storyboard!.instantiateViewControllerWithIdentifier("progressView") as UIViewController
              //  self.presentViewController(thirdViewController, animated: true, completion: nil)
            

            }
        }
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }
    
    var startTime = NSTimeInterval()
    
    var timer:NSTimer = NSTimer()
    
    
    
    func updateTime() {
        let currentTime = NSDate.timeIntervalSinceReferenceDate()
        
        //Find the difference between current time and start time.
        var elapsedTime: NSTimeInterval = currentTime - startTime
        
        //calculate the minutes in elapsed time.
        let minutes = UInt8(elapsedTime / 60.0)
        elapsedTime -= (NSTimeInterval(minutes) * 60)
        
        //calculate the seconds in elapsed time.
        let seconds = UInt8(elapsedTime)
        elapsedTime -= NSTimeInterval(seconds)
        
        //find out the fraction of milliseconds to be displayed.
        let fraction = UInt8(elapsedTime * 100)
        
        //add the leading zero for minutes, seconds and millseconds and store them as string constants
        
        let strMinutes = String(format: "%02d", minutes)
        let strSeconds = String(format: "%02d", seconds)
        let strFraction = String(format: "%02d", fraction)
        
        timeLabel.text = "\(strMinutes):\(strSeconds):\(strFraction)"
    }

    // BLE
    var centralManager : CBCentralManager!
    var peripheralDevice : CBPeripheral!
    var buffer = ""
    var uartService:CBService?
    var txCharacteristic:CBCharacteristic?
    
    
    
    // Check BLE status for centralManager
    func centralManagerDidUpdateState(central: CBCentralManager) {
        
        if central.state == CBCentralManagerState.PoweredOn{
            
            central.scanForPeripheralsWithServices(nil, options: nil)
            self.statusLabel?.text = "Searching for BLE Devices"
            
        }else if central.state == CBCentralManagerState.PoweredOff{
            
            self.statusLabel?.text = "Turn on bluetooth"
            
        }else{
            
            print("Bluetooth switched off or not initialized", terminator: "")
            
        }
    }
    
    // Check out the discovered peripherals to find the deviced you want to connect
    func centralManager(central: CBCentralManager, didDiscoverPeripheral peripheral: CBPeripheral, advertisementData: [String : AnyObject], RSSI: NSNumber) {
        let deviceName = "WHAM"
        let nameOfDeviceFound = peripheral.name
        HUD.show(.Progress)
        print("Found devices--------------------------", terminator: "")
        print(peripheral, terminator: "")
        print("Name Of Device Found ------------------", terminator: "")
        print(nameOfDeviceFound, terminator: "")
        print("---------------------------------------", terminator: "")
        print("---------------------------------------", terminator: "")
        print("---------------------------------------", terminator: "")
        
        if(deviceName == nameOfDeviceFound){
            
            // Update status label
            self.statusLabel?.text = "Device Found"
            // Stop scanning
            self.centralManager.stopScan()
            // Set the peripheral to use and establish connection
       
            self.peripheralDevice = peripheral
            self.peripheralDevice.delegate = self
            self.centralManager.connectPeripheral(peripheral, options: nil)
            HUD.flash(.Success, delay: 1.0)
        }else{
            sleep(1)
            self.statusLabel?.text = "Sensor Tag Not Found"
        }
        }
        
    
    //Connected to Central
    func centralManager(central: CBCentralManager, didConnectPeripheral peripheral: CBPeripheral) {
        print("Peripheral connected.", terminator: "")
        print(peripheral, terminator: "")
        peripheral.delegate = self
        peripheral.discoverServices(nil)
    }
    
    //Discover Service
    func peripheral(peripheral: CBPeripheral, didDiscoverServices error: NSError?) {
        
        if error != nil {
            print("Error discovering services \(error?.localizedDescription)", terminator: "")
            return
        }
        let services = peripheral.services as [CBService]!
        for service in services {
                  //  if (service.characteristics != nil){
               // peripheral.discoverCharacteristics(nil, forService: service)
           // }
            if (service.UUID == CBUUID(string: "6e400001-b5a3-f393-e0a9-e50e24dcca9e")){ //uart
           //     print("found", terminator: "")
                uartService = service
                peripheral.discoverCharacteristics([CBUUID(string: "6e400002-b5a3-f393-e0a9-e50e24dcca9e"), CBUUID(string: "6e400003-b5a3-f393-e0a9-e50e24dcca9e")], forService: uartService!)
                
            }
            //        for service: CBService in peripheral.services! {
            //            peripheral.discoverCharacteristics(nil, forService: service)
            //        }
            
        }
    }
    
    func peripheral(peripheral: CBPeripheral, didDiscoverCharacteristicsForService service: CBService, error: NSError?) {
        
        if error != nil {
            print("Error discovering characteristics \(error?.localizedDescription)", terminator: "")
            return
        }
        else {
            let characteristics = service.characteristics as [CBCharacteristic]!
            for characteristic in characteristics {
               // print(characteristic.UUID, terminator: "")
                switch characteristic.UUID{
                case CBUUID(string: "6e400002-b5a3-f393-e0a9-e50e24dcca9e"):
                    peripheral.setNotifyValue(true, forCharacteristic: characteristic)
                    txCharacteristic = characteristic //found the txCharacteristic!!!
                  //  print("Found TX", terminator: "")
                //    var string: NSString
                  //  string = "ko"
                    //print(exerciseTitle)
                    if ((exerciseTitle == "River Rush") && (startstate != 2)&&(launchBool == true)){
                       writeString("Game1")
                        print("ex1")
                    }
                    else if ((exerciseTitle == "20,000 Leaks") && (startstate != 2)&&(launchBool == true)){
                        writeString("Game2")
                        print("ex2")
                    }
                    else if ((exerciseTitle == "Rally Ball") && (startstate != 2)&&(launchBool == true)){
                        writeString("Game3")
                        print("ex3")
                    }
                    else if ((exerciseTitle == "Reflex Ridge")&&(startstate != 2)&&(launchBool == true)){
                        writeString("Game4")
                        print("ex4")
                    }
                    else if ((exerciseTitle == "Space Pop") && (startstate != 2)&&(launchBool == true)){
                        writeString("Game5")
                        print("ex5")
                    }
                    else {
                      // print("STOP!!!!!!!!!!!!!!!!")
                        writeString("Stop")  //TELL ARDUINO TO STOP DOING STUFFS!!!!!!
                    }
                  //  peripheral.writeValue(data, forCharacteristic: characteristic, type: CBCharacteristicWriteType.WithoutResponse)
                   // print("yes?")
                    break
                case CBUUID(string: "6e400003-b5a3-f393-e0a9-e50e24dcca9e"):
                   // print("found RX too", terminator: "")

                    peripheral.setNotifyValue(true, forCharacteristic: characteristic)
                
                    break
            //    case "2A37":
                    // Set notification on heart rate measurement
             //       print("Found a Heart Rate Measurement Characteristic", terminator: "")
               //     peripheral.setNotifyValue(true, forCharacteristic: characteristic)
               //     break
             //   case "2A38":
                    // Read body sensor location
                //    print("Found a Body Sensor Location Characteristic", terminator: "")
               //     peripheral.readValueForCharacteristic(characteristic)
                //    break
                    //                var rawArray:[UInt8] = [0x01];
                    //                let data = NSData(bytes: &rawArray, length: rawArray.count)
                    //                peripheral.writeValue(data, forCharacteristic: characteristic, type: CBCharacteristicWriteType.WithoutResponse)
                    
                default:
                    print("nope", terminator: "")
                    break
                    
                    
                    // for some devices, you can skip readValue() and print the value here
                    //            }
                }
            }
        }
    }
    
    
    
    //update heart rate value
    func peripheral(peripheral: CBPeripheral, didUpdateValueForCharacteristic characteristic: CBCharacteristic, error: NSError?) {
        if error != nil {
            //            handleError("Error updating value for characteristic\(characteristic.description.utf8) \(error.description.utf8)")
            print("got it", terminator: "")
            return
        }
        else{
            //print("fail")
        }
       // print("here", terminator: "")
        switch characteristic.UUID{
        case CBUUID(string: "6e400002-b5a3-f393-e0a9-e50e24dcca9e"):
            txCharacteristic = characteristic //found the txCharacteristic!!!
           // print("Found TX", terminator: "")
      
            break
            
            //      update(heartRateData:characteristic.value!)
            //    break
        case CBUUID(string: "6e400003-b5a3-f393-e0a9-e50e24dcca9e"):
           // print("got this far", terminator: "")
            //   print(characteristic.value!)
            didReceiveData(characteristic.value!)
            break
        default:
            break
        }
    }
    
    func peripheral(peripheral: CBPeripheral, didWriteValueForCharacteristic characteristic: CBCharacteristic, error: NSError?) {
        if (error != nil) {
            print("error in writing characteristic")
            print(characteristic.UUID)
           
            /*
            // Fix (antonio):
            if ([characteristic.UUID isEqual:[CBUUID UUIDWithString:@"00001531-1212-EFDE-1523-785FEABCD123"]])
            {
            [self.bleDelegate onReadDfuVersion:-100];       // Special mark for old versions
            }
            else
            {
            [self.centralManager cancelPeripheralConnection:peripheral];
            }
            // Endfix
            */
        }
        else {
          //  print("didWriteValueForCharacteristic and value ")
        //    print(characteristic.UUID)
        //    print(characteristic.value)
        }
    
    }
    
    
    
    func writeString(string:NSString){
        //Send string to peripheral
        let data = NSData(bytes: string.UTF8String, length: string.length)
        
        writeRawData(data)
        peripheralDevice.discoverServices(nil);
        }
    
    
    func writeRawData(data:NSData) {
        
        //Send data to peripheral
        
        if (txCharacteristic == nil){
            printLog(self, funcName: "writeRawData", logString: "Unable to write data without txcharacteristic")
            return
        }
        
        var writeType:CBCharacteristicWriteType
        
        if (txCharacteristic!.properties.rawValue & CBCharacteristicProperties.WriteWithoutResponse.rawValue) != 0 {
            
            writeType = CBCharacteristicWriteType.WithoutResponse
            
        }
            
        else if ((txCharacteristic!.properties.rawValue & CBCharacteristicProperties.Write.rawValue) != 0){
            
            writeType = CBCharacteristicWriteType.WithResponse
        }
            
        else{
            printLog(self, funcName: "writeRawData", logString: "Unable to write data without characteristic write property")
            return
        }
        
        //TODO: Test packetization
        
        //send data in lengths of <= 20 bytes
        let dataLength = data.length
        let limit = 20
        
        //Below limit, send as-is
        if dataLength <= limit {
            peripheralDevice.writeValue(data, forCharacteristic: txCharacteristic!, type: writeType)
        }
            
            //Above limit, send in lengths <= 20 bytes
        else {
            
            var len = limit
            var loc = 0
            var idx = 0 //for debug
            
            while loc < dataLength {
                
                let rmdr = dataLength - loc
                if rmdr <= len {
                    len = rmdr
                }
                
                let range = NSMakeRange(loc, len)
                var newBytes = [UInt8](count: len, repeatedValue: 0)
                data.getBytes(&newBytes, range: range)
                let newData = NSData(bytes: newBytes, length: len)
                //                    println("\(self.classForCoder.description()) writeRawData : packet_\(idx) : \(newData.hexRepresentationWithSpaces(true))")
                self.peripheralDevice.writeValue(newData, forCharacteristic: self.txCharacteristic!, type: writeType)
                
                loc += len
                idx += 1
            }
        }
        
    }
    
    //receive data
    func didReceiveData(newData: NSData) {
       // print("what is")
       // print(newData);
        //Data incoming from UART peripheral, forward to current view controller
        updateConsoleWithIncomingData(newData)

        
    }
    
//    func receiveData(newData : NSData){
//        
//        
//        
//        // Update UI
//        updateConsoleWithIncomingData(newData)
//        
//        
//    }
    
    func updateConsoleWithIncomingData(newData:NSData) {
       
        //Write new received data to the console text view
        if (startButton.selected == false) {
            if (startstate != 2) {
        //convert data to string & replace characters we can't display
        let dataLength:Int = newData.length
        print("leng of data")
    print(dataLength)
        if ((dataLength >= 1) && (dataLength < 17)){
        var data = [UInt8](count: dataLength, repeatedValue: 0)
        newData.getBytes(&data, length: dataLength)
        
        for index in 0...dataLength-1 {
            if (data[index] <= 0x1f) || (data[index] >= 0x80) { //null characters
                if (data[index] != 0x9)       //0x9 == TAB
                    && (data[index] != 0xa)   //0xA == NL
                    && (data[index] != 0xd) { //0xD == CR
                        data[index] = 0xA9
                }
                
            }
        }
        
        
        let newString = NSString(bytes: &data, length: dataLength, encoding: NSUTF8StringEncoding)
        //  printLog(self, funcName: "updateConsoleWithIncomingData", logString: newString! as String)
       // print(newString as! String, terminator: "")
   
        
        print(newString)
        //print("new data")
            //assuming sensor[0] contains the score! not sure if it's correct though
            if (newString != nil){
                let sensor = newString!.componentsSeparatedByString(",")
                if ((sensor[1] != "")&&(sensor[0] != "")){
             //   print(sensor[0])
               // numberofdata = numberofdata + 1 //increment to get number of data
               // score = Int(sensor[0])!  //Get the Sum of all values
               // temp1 = score
              //  totalscore = score/numberofdata //Take the average
              //  print(numberofdata)
              //  temp2 = totalscore  //this is just average of all the data values we get
             //   print(sensor[0])
               totalscore = Double(sensor[0])! //TOTAL SCORE IS THE FINAL SCORE AFTER THE ENTIRE EXERCISE!!!!!!!!
                    scoreoutout.text = sensor[0]
                HR = Int(sensor[1])!
                }
               // print(
            }
        
        else {//RESET EVERYTHING BACK TO 0!!!!!!
            numberofdata = 0;
            //print("reset")
            //print(numberofdata)
            score = 0;
            totalscore = 0;
            temp1 = 0;
            temp2 = 0;
                print("done")
        }
            }
    
            }
            
            else {
                print("done with the exercise")
                startstate = 2;
                    peripheralDevice.discoverServices(nil);
              //  writeString("Stop")
                
            }
         //just to be safe, assign it one last time
        
        
      //  peripheralDevice.discoverServices(nil)
        //Check for notification command & send if needed
        //            if newString?.containsString(self.notificationCommandString) == true {
        //                printLog(self, "Checking for notification", "does contain match")
        //                let msgString = newString!.stringByReplacingOccurrencesOfString(self.notificationCommandString, withString: "")
        //                self.sendNotification(msgString)
        //            }
        }
    }
    
    ///////UPDATE HEART RATE
    func update(heartRateData:NSData){
        
        var buffer = [UInt8](count: heartRateData.length, repeatedValue: 0x00)
        heartRateData.getBytes(&buffer, length: buffer.count)
        
        var bpm:UInt16?
        if (buffer.count >= 2){
            if (buffer[0] & 0x01 == 0){
                bpm = UInt16(buffer[1]);
            }else {
                bpm = UInt16(buffer[1]) << 8
                bpm =  bpm! | UInt16(buffer[2])
            }
        }
        
        if let actualBpm = bpm{
            print(actualBpm, terminator: "")
        }else {
            print(bpm, terminator: "")
        }
        
    }

    func printLog(obj:AnyObject, funcName:String, logString:String?) {
        
        if logString != nil {
            print("\(obj.classForCoder!.description()) \(funcName) : \(logString!)")
        }
        else {
            print("\(obj.classForCoder!.description()) \(funcName)")
        }
        
    }
}



extension timerViewController : ORKTaskViewControllerDelegate {
    
    func taskViewController(taskViewController: ORKTaskViewController, didFinishWithReason reason: ORKTaskViewControllerFinishReason, error: NSError?) {
        //Handle results with taskViewController.result
        taskViewController.dismissViewControllerAnimated(true, completion: nil)
    }
    
}
