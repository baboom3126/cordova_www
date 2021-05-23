var urlKeyValue = location.href.split('?')[1]
var splitUrlKeyValue = urlKeyValue.split('&')
var thisClass = {}
for (var i in splitUrlKeyValue) {
    var temp = splitUrlKeyValue[i].split('=')
    thisClass[temp[0]] = temp[1]
}


$(document).ready(function () {
    $('#div_className').text(decodeURIComponent(thisClass.className))

    var classTextbook = JSON.parse(localStorage.getItem('classTextbook'))
    if (classTextbook == null) {
        swal.fire('請更新資料')
    } else {
        var filterClassTextbook = classTextbook.filter(function(item, index, array){
            return item.ClassId == thisClass.classId
        })
        var filterTextbook = JSON.parse(localStorage.getItem('textbook')).filter(function(item,index,array){
            for(let i in filterClassTextbook){
                if(filterClassTextbook[i].TextbookId == item.TextbookId){
                    return item
                }
            }
        })

        showDivChapterList(filterTextbook)


    }
})


var showDivChapterList = function (data) {
    console.log(data)
    var appendHtml = ``
    for (let i in data) {

        appendHtml += `
        <div class="row" style="margin-bottom: 0;border-bottom: 1px solid #e1f2ff;">
        <div class="col s2" style="padding-top: 20px;padding-bottom: 20px;text-align: center; font-size: large;font-weight: bold;color: #5F89C7;">
            <img style="height:15px;" src="./img/main/right_arrow.png">
        </div><a href="textbook.html?textbookId=${data[i].TextbookId}&textbookName=${data[i].TextbookName}">
        <div class="col s10" style="padding-top: 20px;padding-bottom: 20px;padding-left: 0px;word-break: break-all;color: #5F89C7;font-weight: 500;">
            ${data[i].TextbookName}
        </div></a>
    </div>
    `
    }


    $('#div_textbookList').html(appendHtml)
}