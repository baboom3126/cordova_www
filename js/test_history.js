$(document).ready(function(){
    swal.showLoading()

    let postData = {}
    postData.studentId = JSON.parse(localStorage.getItem("student")).studentId
    let settings = {
        "async": true,
        "crossDomain": true,
        "url": baseUrl + "app/getTestResultWithChapterNames",
        "method": "POST",
        "headers": {
            "content-type": "application/json",
            "cache-control": "no-cache",
        }, data: JSON.stringify(postData)
    }
    $.ajax(settings).done(function (response, status) {
        console.log(response)
        let data = {}
        for(result of response.data){
            if(!data[result.TestResultId]){
                data[result.TestResultId]={}
                data[result.TestResultId]['chapter'] = [[result.TextbookName,result.TextbookContentName,result.TextbookContentChapterName]]
                data[result.TestResultId]['detail'] = {'TestMode':result.TestMode,'CreateTime':result.CreateTime}
            }else{
                data[result.TestResultId]['chapter'].push([result.TextbookName,result.TextbookContentName,result.TextbookContentChapterName])
            }
        }
        console.log(data)
        let appendHtml = ''
        for(key of Object.keys(data)){

            let appendHtmlForChapterNames = '<p style="color:#707070;">'
            let counter = 1
            for(chapter of data[key]['chapter']){
                appendHtmlForChapterNames += counter+'. '+chapter.join('>')+'<br>'
                counter += 1
            }

            appendHtml+=`
                        <li>
                <div class="collapsible-header row div_border_bottom" tabindex="0">

                    <div class="col s12 "><span class="font_bold">模式${data[key]['detail']['TestMode']}</span> > ${new Date(data[key]['detail']['CreateTime']).toLocaleString()}</div>
                </div>
                <div class="collapsible-body">
                    <div class="div_test_history_detail ">
                        <div class="row container" style="margin-bottom:0!important;">

                            <div class="col s10">
                                <div><span class="font_bold">測驗章節</span>
                                </div>
                                ${appendHtmlForChapterNames}
                            </div>
                            <div class="col s2 div_go_search_btn waves-effect waves-light" onclick="javascript:go_test_history_detail_page('${key}','${data[key]['detail']['TestMode']}')">查看
                            </div>
                        </div>

                    </div>

                </div>
            </li>

            `


        }
        $('#ul_history_info').html(appendHtml)
    })






    $('.collapsible').collapsible();
    swal.close()
});


let go_test_history_detail_page = function (testResultId,testMode){
    location.href= './test_history_detail.html?testResultId='+testResultId+'&testMode='+testMode
}