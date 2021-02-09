// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
// const server = require('./server/index')
const ipcRenderer = require('electron').ipcRenderer;

var fs = require('fs'),
    textarea = $("#textarea_t"),
    holder = $("#holder"),
    button = $("#btn_write");


function deleteall(path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.statSync(curPath).isFile() && file !== "user.txt") {
                fs.unlinkSync(curPath);
            }
        });
    }
};
$("button").click(function () {
    deleteall(__dirname + "/server/public");
});

holder.on("dragenter dragover", function (event) {
    // 重写ondragover 和 ondragenter 使其可放置
    event.preventDefault();

    // holder.addClass("holder-ondrag");
    // holder.text("Release Mouse");
});

holder.on("dragleave", function (event) {
    event.preventDefault();

    // holder.removeClass("holder-ondrag");
    // holder.text("Please Drag sth. in here");
});

holder.on("drop", function (event) {
    // 调用 preventDefault() 来避免浏览器对数据的默认处理（drop 事件的默认行为是以链接形式打开） 
    event.preventDefault();

    // 原生语句如下，但引进jquery后要更改
    // var file=event.dataTransfer.files[0];
    // 原因：
    // 在jquery中，最终传入事件处理程序的 event 其实已经被 jQuery 做过标准化处理，
    // 其原有的事件对象则被保存于 event 对象的 originalEvent 属性之中，
    // 每个 event 都是 jQuery.Event 的实例
    // 应该这样写:
    var efile = event.originalEvent.dataTransfer.files[0];

    let npcData = {};
    let getFileName = (fileList) => {
        for (let i = 0; i < fileList.length; i++) {
            let str = fileList[i];
            let fullName = str.split('.')[0];
            let key = fullName.substring(0, fullName.length - 4);
            if (key === '') { continue; }
            if (!npcData[key]) { //目录下可能存在多个龙骨文件
                npcData[key] = {};
            }
            let endName = str.split('.')[1];
            if (str.indexOf('ske') !== -1) {
                npcData[key]['ske'] = str
            }
            if (str.indexOf('tex') !== -1 && endName === 'json') {
                npcData[key]['tex'] = str
            }
            if (str.indexOf('tex') !== -1 && endName === 'png') {
                npcData[key]['texture'] = str
            }
        }
    }

    let readdir = () => {
        const fileList = fs.readdirSync(efile.path);
        getFileName(fileList);
        //写入到缓存目录
        fileList.forEach((item) => {
            if (item.split('.')[0].length === 0) { return; }
            let data = fs.readFileSync(efile.path + "/" + item);
            fs.writeFileSync(__dirname + '/server/public/' + item, data, { flag: 'w' });
        })
        setTimeout(() => {
            setTimeout(() => {
                ipcRenderer.send('new-window', npcData);
            }, 1)
        }, 2)
    }

    fs.stat(efile.path, function (err, stats) {
        if (!stats.isDirectory()) {
            alert("请拖入文件夹");
            return;
        }
        readdir();
    })
    return false;
});