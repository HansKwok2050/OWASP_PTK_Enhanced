/* Author: Kwok Wing Hong */

import { ptk_controller_dirbuster } from "../../../controller/dirbuster.js"

const controller = new ptk_controller_dirbuster()
let ascending = false

jQuery(function () {

    controller.dt = []

    controller.init().then(function (result) {
        bindInfo(result)
    }).catch(e => console.log(e))

    $(document).on('click', "#start_scan", function (e) { // start scan will lock automatically and lock the lock until it ends
        document.getElementById('start_scan').style.display = 'none';
        document.getElementById('stop_scan').style.display = 'inline';
        document.getElementById('lock_url').style.display = 'none';
        document.getElementById('unlock_url').style.display = 'inline';

        controller.start_scan(document.getElementById('currentURL').value).then(function (result) {
        })
    })

    $(document).on('click', "#stop_scan", function (e) {
        document.getElementById('start_scan').style.display = 'inline';
        document.getElementById('stop_scan').style.display = 'none';

        controller.stop_scan().then(function (result) {
        })
    })

    $(document).on('click', "#lock_url", function (e) {
        controller.lock_url(document.getElementById('currentURL').value).then(function (result) {
            if (result.isScanning == false) { // if is scanning than does nothing
                document.getElementById('lock_url').style.display = 'none';
                document.getElementById('unlock_url').style.display = 'inline';
            }
        })
    })

    $(document).on('click', "#unlock_url", function (e) {
        controller.unlock_url().then(function (result) {
            if (result.isScanning == false) { // if is scanning than does nothing
                document.getElementById('lock_url').style.display = 'inline';
                document.getElementById('unlock_url').style.display = 'none';
            }
        })
    })

    $(document).on('click', "#export_result", function (e) {
        controller.export_result().then(function (result) {
            if (result.record != null) {
                let list = JSON.stringify(result.record, null, 4)
                let blob = new Blob([list], { type: 'text/plain' })
                let downloadLink = document.createElement("a")
                downloadLink.download = "PTK_dirbuster_" + (new URL(result.record[0][0])).hostname + ".txt"
                downloadLink.href = window.URL.createObjectURL(blob)
                downloadLink.click()
            }
        })
    })

    $(document).on('click', "#clear_all", function (e) {
        controller.clear_all().then(function (result) {
            if (result.isScanning == false) { // if is scanning than does nothing
                document.getElementById('wordlist').value = null;

                let table = document.getElementById("dirbuster_frames");
                while (table.rows.length > 1) {
                    table.deleteRow(1);
                }
            }
        })
    })

    /*$(document).on('click', "#import_list", function (e) {
        document.getElementById('import_list_input').click();
    })

    $(document).on('change', "#import_list_input", function (e) {
        readFromFile()
    })*/


    $('th').click (function (e) {
        let column = $(this).data('index');
        let table = $('#dirbuster_frames');
        var rows = table.find("tr:gt(0)").toArray().sort(comparer(column));

        if (ascending == true) {
            rows = rows.reverse();
            ascending = false;
        } else {
            ascending = true;
        }

        table.append(rows);
    });

    document.getElementById('wordlist').addEventListener("input", function () {
        controller.update_wordlist(document.getElementById('wordlist').value.split("\n")).then(function (result) {
        })
    });

    document.getElementById('currentURL').addEventListener("input", function () {
        controller.update_url(document.getElementById('currentURL').value).then(function (result) {
        })
    });
})

async function bindInfo(result) {
    if (controller.url) {
        $('#dashboard_message_text').text(controller.url)
    } else {
        browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            let activeTab = tabs[0];
            $('#dashboard_message_text').text(activeTab.url)
        });
    }

    if (result.wordlist && result.wordlist[0]) {
        let content = result.wordlist[0] + "\n"
        for (let i = 1; i < result.wordlist.length; i++) {
            content = content + result.wordlist[i] + "\n"
        }
        document.getElementById('wordlist').value = content;
    } else {
        document.getElementById('wordlist').value = null;
    }

    if (result.locked == true && result.originURL != "") {
        document.getElementById('currentURL').value = result.originURL;
        document.getElementById('lock_url').style.display = 'none';
        document.getElementById('unlock_url').style.display = 'inline';
    } else if (controller.url) {
        document.getElementById('currentURL').value = controller.url;
    } else {
        browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            let activeTab = tabs[0];
            document.getElementById('currentURL').value = activeTab.url;
        });
    }

    if (result.isScanning == true) {
        document.getElementById('start_scan').style.display = 'none';
        document.getElementById('stop_scan').style.display = 'inline';
    }

    if (result.record != []) {
        for (let i = 0; i < result.record.length; i++) {
            bindFrames(result.record[i])
        }
    }
}

function bindFrames(record) {
    let table = document.getElementById("dirbuster_frames");

    let newRow = table.insertRow(-1);

    let cell1 = newRow.insertCell(0);
    let cell2 = newRow.insertCell(1);
    let cell3 = newRow.insertCell(2);

    let recordLink = document.createElement("a");
    recordLink.href = record[0];
    recordLink.innerText = record[0];
    recordLink.setAttribute("target", "_blank");  

    cell1.appendChild(recordLink);
    cell2.innerHTML = record[1];
    cell3.innerHTML = record[2];

    cell1.style = "max-width: 400px !important; max-height: 100px !important; overflow-wrap: break-word; word-wrap: break-word; overflow:hidden; text-overflow: ellipsis; white-space: nowrap"

    table.append(newRow)
}

browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.channel == "ptk_background2popup_dirbuster") {
        if (message.type == "scaner_updated") { 
            document.getElementById('scanning_url').innerHTML = message.content;
        } else if (message.type == "record_added") {
            bindFrames(message.content)
        } else if (message.type == "record_cleared") {
            let table = document.getElementById("dirbuster_frames");
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
        } else if (message.type == "scan_finished") {
            document.getElementById('start_scan').style.display = 'inline';
            document.getElementById('stop_scan').style.display = 'none';
        } 
    }
})

function limitText(textarea, limit) {
    function limitLines() {
        let lines = textarea.value.split("\n");
        if (lines.length > limit) {
            textarea.value = lines.slice(0, limit).join("\n");
        }
    }

    limitLines();
    let timeout;
    textarea.addEventListener("input", function () {
        clearTimeout(timeout);
        timeout = setTimeout(limitLines, 1);
    });
}

limitText(document.getElementById("wordlist"), 3000);

function comparer(index) {
    return function(a, b) {
        let valA = getCellValue(a, index);
        let valB = getCellValue(b, index);

        return $.isNumeric(valA) && $.isNumeric(valB) 
            ? valA - valB 
            : valA.toString().localeCompare(valB);
    };
}

function getCellValue(row, index) {
    return $(row).children('td').eq(index).text();
}

/*function readFromFile() {
    let file = document.getElementById("import_list_input").files[0];
    if (file && file.type === 'text/plain') {
        let reader = new FileReader();
        reader.onload = function(e) {
            let content = e.target.result.replace(/ /g, '\n');
            let wordlist = document.getElementById('wordlist')
            wordlist.value = content;

            limitText(wordlist, 4);
        };
        reader.readAsText(file);
        reader.onerror = function (e) {
            document.getElementById("scanning_url").innerHTML = "error reading file";
        }
    }
}*/