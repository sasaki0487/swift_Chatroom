//
//  ViewController.swift
//  MyChatRoom
//
//  Created by ESD 29 on 2018/11/30.
//  Copyright © 2018年 ESD 29. All rights reserved.
//
import SocketIO
import UIKit

class ViewController: UIViewController {

    @IBOutlet weak var userTextField: UITextField!
    @IBOutlet weak var messageTextField: UITextField!
    @IBOutlet weak var chatTextView: UITextView!
    @IBOutlet weak var userTextView: UITextView!
    
    let hostString: String = "http://localhost:3000"
    var socket : SocketIOClient? = nil
    var manager: SocketManager? = nil
    var myname : String? = nil
    
    func anyEventCallBack( anyEvent: SocketAnyEvent)
    {
        //列列印出所有收到的event跟event附帶的data，debug時可⽤用
        //print("--- Got event: \(anyEvent.event), with items: \(anyEvent.items) ---")
    }
    func connectCallBack( data:[Any], ack:SocketAckEmitter)
    {
        print("--- socket connected ---")
        //因為剛連上，Delay 0.5秒，再傳送message，讓server有時間註冊好event
        let deadLine = DispatchTime.now() + .milliseconds(500)
        DispatchQueue.main.asyncAfter(deadline: deadLine) {
            //利用socket傳送 event + message 給server
            self.socket!.emit("user send out message", "Hello! I've connected!")
        }
    }
    func serverMsgCallBack( data:[Any], ack:SocketAckEmitter)
    {
        print("--- receive \"show message on screen\" event ---")
        //找出message string
        let message: String = (data[0] as! String)
        print("received:\n\n" + "\(message)" + "\n")
        self.chatTextView.text = "\(message)\n\(self.chatTextView.text!)"
    }
    func nameMsgCallBack( data:[Any], ack:SocketAckEmitter)
    {
        let message: String = (data[0] as! String)
        self.userTextView.text = message
        
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        // Do any additional setup after loading the view, typically from a nib.
        let hostUrl = URL(string: self.hostString)
        //創造Socket Manager，同時設定socket將連線到的URL
        self.manager = SocketManager(socketURL: hostUrl!)
        //從Socket Manager取得SocketIOClient物件
        self.socket = self.manager?.defaultSocket
        //把anyEventCallBack這個function設定成socket中所有event的handler，告訴socket接到所有的 event時都要call anyEventCallBack這個函數
        self.socket!.onAny(anyEventCallBack)
        //把connectCallBack這個functio 設定成socket中 "connect" event的handler，告訴socket接到"connect" event時要call connectCallBack這個函數
        self.socket!.on("connect",callback: connectCallBack)
        //把serverMsgCallBack這個function設定成 "show message on screen" event的handler，告訴 socket接到 "show message on screen" event時要call serverMsgCallBack這個函數
        self.socket!.on("show message on screen", callback: serverMsgCallBack)
        //創造連線⽤用的URL物件
        self.socket!.on("name", callback: nameMsgCallBack)
        
    }

    override func didReceiveMemoryWarning() {
        super.didReceiveMemoryWarning()
        // Dispose of any resources that can be recreated.
    }


    @IBAction func pmButtonPressed(_ sender: Any) {
        let name: String = self.userTextField.text!
        let message: String = self.messageTextField.text!
        let str = name + ":" + message
        self.socket!.emit("private", str)
    }
    @IBAction func disconnectButtonPressed(_ sender: Any) {
        self.socket!.disconnect()
        self.userTextView.text = ""
    }
    @IBAction func connectButtonPressed(_ sender: Any) {
        //叫socket連線到前⾯面已指定的Server
        self.socket!.connect()
        let name: String = self.userTextField.text!
        self.myname = self.userTextField.text!
        let deadLine = DispatchTime.now() + .milliseconds(500)
        DispatchQueue.main.asyncAfter(deadline: deadLine) {
            //利用socket傳送 event + message 給server
            self.socket!.emit("register", name)
        }
    }
    @IBAction func sendButtonPressed(_ sender: Any) {
        let message: String = self.messageTextField.text!
        let str = self.myname! + ": " + message
        self.socket!.emit("user send out message", str)
        self.messageTextField.text = ""
        
    }
}

