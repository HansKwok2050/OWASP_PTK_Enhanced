/* Author: Kwok Wing Hong */

import { ptk_logger, ptk_utils, ptk_storage } from "./utils.js"

const worker = self

export class ptk_dirbuster {
    constructor() {
        this.wordlist = []
        this.record = []
        this.originURL = ""
        this.locked = false
        this.isScanning = false
        this.storageKey = "ptk_dirbuster"
        this.storage = ptk_storage.getItem(this.storageKey)
        this.addMessageListiners()
    }

    addMessageListiners() {
        this.onMessage = this.onMessage.bind(this)
        browser.runtime.onMessage.addListener(this.onMessage)
    }

    onMessage(message, sender, sendResponse) {
        if (!ptk_utils.isTrustedOrigin(sender))
            return Promise.reject({ success: false, error: 'Error origin value' })

        if (message.channel == "ptk_popup2background_dirbuster") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve()
        }
    }

    msg_init(message) {
        return Promise.resolve(Object.assign({"wordlist": this.wordlist, "record": this.record, "originURL": this.originURL, "locked": this.locked, "isScanning": this.isScanning}, worker.ptk_app.proxy.activeTab))
    }

    msg_update_wordlist(message) {
        this.wordlist = message.content
        return Promise.resolve()
    }

    msg_update_url(message) {
        this.originURL = message.content
        return Promise.resolve()
    }

    msg_clear_all(message) {
        if (this.isScanning == false) {
            this.record = []
            this.wordlist = []

            browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "scaner_updated", content: "Wordlist and scan record cleared."})
        }
        return Promise.resolve({"isScanning" : this.isScanning})
    }

    msg_lock_url(message){
        if (this.isScanning == false) {
            this.locked = true
            this.originURL = message.content
            browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "scaner_updated", content: "Origin URL locked."})
        }
        return Promise.resolve({"isScanning" : this.isScanning})
    }

    msg_unlock_url(message){
        if (this.isScanning == false) {
            this.locked = false
            browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "scaner_updated", content: "Origin URL unlocked."})
        }
        return Promise.resolve({"isScanning" : this.isScanning})
    }

    msg_stop_scan(message){
        if (this.isScanning == true) {
            console.log("Stopped dirbuster scan")
            browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "scaner_updated", content: "Scan terminated."})
        }
        this.isScanning = false
        return Promise.resolve()
    }

    async msg_start_scan(message) {
        browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "scan_started"})
        
        if (this.wordlist.length == 0) {
            browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "scaner_updated", content: "Error: wordlist empty."})
            browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "scan_finished"})
            return Promise.resolve()
        }
        if (this.originURL == "" || this.locked == false) {
            this.originURL = message.content
        } 
        if (this.originURL == "") {
            browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "scaner_updated", content: "Error: cannot find origin URL"})
            browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "scan_finished"})
            return Promise.resolve()
        }
        if (this.originURL.charAt(this.originURL.length - 1) == "/" ) {
            this.originURL = this.originURL.substring(0, this.originURL.length - 1);
        }

        console.log("Starting dirbuster scan with origin URL = " + this.originURL)
        browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "record_cleared"})
        this.record = []
        this.isScanning = true

        try{
            for (let i = 0; i < this.wordlist.length; i++) {
    
                if (this.isScanning == true && this.originURL != "null") {

                    let targetWord = this.wordlist[i]
                    let targetURL = ""


                    if (targetWord.charAt(targetWord.length - 1) == "/" ) {
                        targetWord = targetWord.substring(0, targetWord.length - 1);
                    }
                    if (targetWord.charAt(0) != "/") {
                        targetURL = this.originURL + "/" + targetWord;
                    } else {
                        targetURL = this.originURL + targetWord;
                    }

                    browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "scaner_updated", content: "Scanning: " + targetURL + " ..."})
        
                    let request = new XMLHttpRequest();
                    request.open("GET", targetURL, false);
                    request.send(null);
    
                    let response = request.status;   
                    let responseLenght = request.responseText.length;
    
                    if (response != "404") {
                        this.record.push([targetURL, response, responseLenght])
                        browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "record_added", content: [targetURL, response, responseLenght]})
                    }
                } else {
                    break;
                }
            }
        } catch (error) {
            this.isScanning = false
            browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "scaner_updated", content: "Error: cannot send request."})
            browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "scan_finished"})
            return Promise.resolve()
        }

        this.isScanning = false
        browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "scaner_updated", content: "Scan completed."})
        browser.runtime.sendMessage({ channel: "ptk_background2popup_dirbuster", type: "scan_finished"})
        return Promise.resolve()
    }

    msg_export_result(message){
        return Promise.resolve({"record" : this.record})
    }
}