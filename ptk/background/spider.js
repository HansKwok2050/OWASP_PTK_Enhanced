/* Author: Kwok Wing Hong */

import { ptk_logger, ptk_utils, ptk_storage } from "./utils.js"

const worker = self

export class ptk_spider {
    constructor() {
        this.maxDepth = 1
        this.record = []
        this.originURL = ""
        this.locked = false
        this.isScanning = false
        this.storageKey = "ptk_spider"
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

        if (message.channel == "ptk_popup2background_spider") {
            if (this["msg_" + message.type]) {
                return this["msg_" + message.type](message)
            }
            return Promise.resolve()
        }
    }

    msg_init(message) {
        return Promise.resolve(Object.assign({"depth": this.maxDepth, "record": this.record, "originURL": this.originURL, "locked": this.locked, "isScanning": this.isScanning}, worker.ptk_app.proxy.activeTab))
    }

    msg_update_depth(message) {
        this.maxDepth = message.content
        return Promise.resolve()
    }

    msg_update_url(message) {
        this.originURL = message.content
        return Promise.resolve()
    }

    msg_clear_all(message) {
        if (this.isScanning == false) {
            this.record = []

            browser.runtime.sendMessage({ channel: "ptk_background2popup_spider", type: "scaner_updated", content: "Scan record cleared."})
        }
        return Promise.resolve({"isScanning" : this.isScanning})
    }

    msg_lock_url(message){
        if (this.isScanning == false) {
            this.locked = true
            this.originURL = message.content
            browser.runtime.sendMessage({ channel: "ptk_background2popup_spider", type: "scaner_updated", content: "Origin URL locked."})
        }
        return Promise.resolve({"isScanning" : this.isScanning})
    }

    msg_unlock_url(message){
        if (this.isScanning == false) {
            this.locked = false
            browser.runtime.sendMessage({ channel: "ptk_background2popup_spider", type: "scaner_updated", content: "Origin URL unlocked."})
        }
        return Promise.resolve({"isScanning" : this.isScanning})
    }

    msg_stop_scan(message){
        if (this.isScanning == true) {
            console.log("Stopped spider scan")
            browser.runtime.sendMessage({ channel: "ptk_background2popup_spider", type: "scaner_updated", content: "Scan terminated."})
        }
        this.isScanning = false
        return Promise.resolve()
    }

    async msg_start_scan(message) {
        browser.runtime.sendMessage({ channel: "ptk_background2popup_spider", type: "scan_started"})
        
        if (this.originURL == "" || this.locked == false) {
            this.originURL = message.content
        } 
        if (this.originURL == "") {
            browser.runtime.sendMessage({ channel: "ptk_background2popup_spider", type: "scaner_updated", content: "Error: cannot find origin URL"})
            browser.runtime.sendMessage({ channel: "ptk_background2popup_spider", type: "scan_finished"})
            return Promise.resolve()
        }
        if (this.originURL.charAt(this.originURL.length - 1) == "/" ) {
            this.originURL = this.originURL.substring(0, this.originURL.length - 1);
        }

        console.log("Starting spider scan with depth = " + this.maxDepth)
        browser.runtime.sendMessage({ channel: "ptk_background2popup_spider", type: "record_cleared"})
        this.record = []
        this.isScanning = true
        let queue = [{ url: this.originURL, depth: 0 }]
        let visitedUrl = []

        while (queue.length > 0 && this.isScanning == true) {
            let targetURL = queue[0].url // targeturl
            let currentDepth = queue[0].depth // current

            queue.shift()

            if (currentDepth <= this.maxDepth && !visitedUrl.includes(targetURL)) {
                visitedUrl.push(targetURL)

                try {
                    let response = await fetch(targetURL);
                    if (!response.ok) {
                        console.warn(`Failed to fetch ${targetURL}: ${response.statusText}`);
                        continue;
    
                    }

    
                    let html = await response.text();
                    let parser = new DOMParser();
                    let doc = parser.parseFromString(html, 'text/html');
                    let linkElements = doc.querySelectorAll('a[href]');
                    let links = [];
            
                    linkElements.forEach(link => {
                        let href = link.getAttribute('href');
                        if (href.startsWith('/')) {
                            let subURL = new URL(this.originURL);
                            href = `${subURL.protocol}//${subURL.host}${href}`;
                        } else if (!href.startsWith('http')) {
                            let subURL = new URL(this.originURL);
                            href = `${subURL.protocol}//${subURL.host}/${href}`;
                        }
                        links.push(href);
                    });
    

                    this.record.push([targetURL, currentDepth, html.length])
                    browser.runtime.sendMessage({ channel: "ptk_background2popup_spider", type: "record_added", content: [targetURL, currentDepth, html.length]})
                    browser.runtime.sendMessage({ channel: "ptk_background2popup_spider", type: "scaner_updated", content: "Scanning: " + targetURL + " ..."})
                    
                    links.forEach(link => {
                        if (!visitedUrl.includes(link)) {
                            queue.push({ url: link, depth: currentDepth + 1 });
                        }
                    });
                } catch (error) {
                    console.error(`Fetch error for ${targetURL}:`, error);
                }
            } 
        }
        this.isScanning = false
        browser.runtime.sendMessage({ channel: "ptk_background2popup_spider", type: "scaner_updated", content: "Scan completed."})
        browser.runtime.sendMessage({ channel: "ptk_background2popup_spider", type: "scan_finished"})
        return Promise.resolve()
    }

    msg_export_result(message){
        return Promise.resolve({"record" : this.record})
    }
}