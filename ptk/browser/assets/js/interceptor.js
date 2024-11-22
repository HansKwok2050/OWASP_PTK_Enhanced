/* Author: Kwok Wing Hong */

import { ptk_controller_interceptor } from "../../../controller/interceptor.js"

const controller = new ptk_controller_interceptor()

jQuery(function () {

    controller.dt = []

    controller.init().then(function (result) {
        if (result.interceptorEnabled == true) {
            $('#enable_interceptor').prop('checked', true);
        }

        bindInfo(result)
    })

    $(document).on('change', '#enable_interceptor', function (e) { 
        if ($("#enable_interceptor").is(':checked') == true) {// enable
            controller.toggle_interceptor().then(function (result) {
            })
            controller.toggle_listener().then(function (result) {
            })
        } else {// disable
            controller.toggle_interceptor().then(function (result) {
            })
            controller.toggle_listener().then(function (result) {
            })
        }
    })

    //$(document).on('click', "#open_tab", function (e) {
    //    browser.tabs.create({
    //        url: "interceptor.html",
    //        active: true 
    //    });
    //})

    $(document).on('click', "#export_result", function (e) {
        controller.export_result().then(function (result) {
            if (result.record != null) {
                let list = JSON.stringify(result.record, null, 4)
                let blob = new Blob([list], { type: 'text/plain' })
                let downloadLink = document.createElement("a")
                downloadLink.download = "PTK_interceptor.txt"
                downloadLink.href = window.URL.createObjectURL(blob)
                downloadLink.click()
            }
        })
    })

    $(document).on('click', "#clear_all", function (e) {
        controller.clear_all().then(function (result) {
        })
    })

    $(document).on("click", ".rbuilder", function (e) {
        let index = $(this).data("index")
        controller.request_record(index).then(function (result) {
            delete result.record.documentUrl
            result.record.requestBody = null
            if (result.record.requestHeaders == null) {
                result.record.requestHeaders = []
            }
            window.location.href = "rbuilder.html?requestDetails=" + btoa(encodeURIComponent(JSON.stringify(result.record)))
        })
    })

    $(document).on('click', ".expandbtn", function (e) {
        let index = $(this).data("index")
        expand_table(this, index)
    })

    function expand_table(btn, index) {
        let table = document.getElementById("interceptor_frames");
        let currentRow = btn.parentNode.parentNode;

        controller.request_record(index).then(function (result) {
            if (btn.classList.contains("plus")) {
                btn.classList.remove("plus");
                btn.classList.add("minus");

                let newRow = table.insertRow(currentRow.rowIndex + 1);
                let cell1 = newRow.insertCell(0);
                cell1.colSpan = table.rows[0].cells.length;

                let content = JSON.stringify(result.record)
                content = content.substring(1);
                content = content.substring(0, content.length - 1);
                content = content.replace(/,/g, '\n');
                content = content.replace(/"/g, '');

                let div = document.createElement("div");
                div.innerText = content
                div.style = "margin-left: 80px; overflow:hidden; text-overflow: ellipsis; white-space: nowrap"

                cell1.appendChild(div);
            } else {
                table.deleteRow(currentRow.rowIndex + 1);
                btn.classList.add("plus");
                btn.classList.remove("minus");
            }
        })
    }

    $('th').click (function (e) {
        let column = $(this).data('index');
        let table = $('#interceptor_frames');
        var rows = table.find("tr:gt(0)").toArray().sort(comparer(column));

        if (ascending == true) {
            rows = rows.reverse();
            ascending = false;
        } else {
            ascending = true;
        }

        table.append(rows);
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

    if (result.record != []) {
        for (let i = 0; i < result.record.length; i++) {
            bindFrames(result.record[i], i)
        }
    }
}

function bindFrames(record, index) {
    let table = document.getElementById("interceptor_frames");

    let newRow = table.insertRow(-1);

    let cell1 = newRow.insertCell(0);
    let cell2 = newRow.insertCell(1);
    let cell3 = newRow.insertCell(2);
    let cell4 = newRow.insertCell(3);
    let cell5 = newRow.insertCell(4);
    let cell6 = newRow.insertCell(5);

    let rbuilderdiv = document.createElement("div") 
    rbuilderdiv.style = "min-width:40px"
    let rbuilderdiv2 = document.createElement("div")
    rbuilderdiv2.classList.add("ui");
    rbuilderdiv2.classList.add("mini");
    rbuilderdiv2.classList.add("icon");
    rbuilderdiv2.classList.add("button");
    rbuilderdiv2.classList.add("request_details");
    rbuilderdiv2.style = "margin-left: 10px"
    let rbuilderbtn = document.createElement("i")
    rbuilderbtn.classList.add("rbuilder");
    rbuilderbtn.classList.add("large");
    rbuilderbtn.classList.add("icon");
    rbuilderbtn.classList.add("wrench");
    rbuilderbtn.dataset.position = "bottom left"
    rbuilderbtn.dataset.index = index
    rbuilderbtn.title = "Send to R-Builder"
    rbuilderdiv2.appendChild(rbuilderbtn);
    rbuilderdiv.appendChild(rbuilderdiv2);

    let expandbtn = document.createElement("i")
    expandbtn.classList.add("expandbtn");
    expandbtn.classList.add("plus");
    expandbtn.classList.add("square");
    expandbtn.classList.add("large");
    expandbtn.classList.add("icon");
    expandbtn.style = "margin-left: 10px"
    expandbtn.dataset.position = "bottom left"
    expandbtn.dataset.index = index
    expandbtn.title = "Expand for details"

    let recordLink = document.createElement("a");
    recordLink.href = record.url;
    recordLink.innerText = record.url;
    recordLink.setAttribute("target", "_blank");  

    cell1.appendChild(rbuilderdiv2);
    cell2.appendChild(expandbtn);
    cell3.appendChild(recordLink);
    cell4.innerHTML = record.requestId;
    cell5.innerHTML = record.method;
    cell6.innerHTML = record.type;

    cell3.style = "max-width: 400px !important; max-height: 100px !important; overflow-wrap: break-word; word-wrap: break-word; overflow:hidden; text-overflow: ellipsis; white-space: nowrap"
    cell5.style ="max-width: 100px !important; overflow:hidden; text-overflow: ellipsis; white-space: nowrap"

    table.append(newRow)
}

browser.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.channel == "ptk_background2popup_interceptor") {
        if (message.type == "record_added") { 
            bindFrames(message.content, message.index)
        } else if (message.type == "record_cleared") { 
            let table = document.getElementById("interceptor_frames");
            while (table.rows.length > 1) {
                table.deleteRow(1);
            }
        } else if (message.type == "enable_interceptor") { 
            if (document.getElementById("enable_interceptor").checked == false) { 
                document.getElementById("enable_interceptor").checked = true
            }
        } else if (message.type == "disable_interceptor") { 
            if (document.getElementById("enable_interceptor").checked == true) { 
                document.getElementById("enable_interceptor").checked = false
            }
        }
    }
})

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