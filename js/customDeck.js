var db = null

$(document).ready(function () {
    document.addEventListener('deviceready', async function () {

        if (cordova.platformId === "browser") {
            db = openDatabase('word', '1.0', 'wordDB', 50 * 1024 * 1024);
        } else {
            db = window.sqlitePlugin.openDatabase({
                name: 'word',
                location: 'default',
            });
        }

        checkCustomDeckDbs()



        showCustomDeckList()



    })
})

const checkCustomDeckDbs = function(){
    db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS customdeck (deckId, deckName)');
        tx.executeSql('CREATE TABLE IF NOT EXISTS customdecklist (deckId,wordId)');
    }, function (error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function () {
        console.log('insert database OK')
    })
}

const showCustomDeckList = function(){
    db.transaction(function (tx) {
        tx.executeSql('SELECT * FROM customdeck', [], function (tx, rs) {
            for(let i =0;i<rs.rows.length;i++){
                $('#div_customDeckList').append(`
                <div class="row" style="margin-bottom: 0;border-bottom: 1px solid #e1f2ff;">
                <div class="col s2" style="padding-top: 20px;padding-bottom: 20px;text-align: center; font-size: large;font-weight: bold;color: #5F89C7;">
                    <img style="height:15px;" src="./img/main/right_arrow.png">
                </div><a href="customDeckDetail.html?deckId=${rs.rows.item(i).deckId}&deckName=${rs.rows.item(i).deckName}">
                <div class="col s8" style="padding-top: 20px;padding-bottom: 20px;padding-left: 0px;word-break: break-all;color: #5F89C7;font-weight: 500;">
                ${rs.rows.item(i).deckName}
                </div></a>
                <div class="col s2" onclick="javascript:del_customDeckById('${rs.rows.item(i).deckId}','${rs.rows.item(i).deckName}')" style="padding-top: 20px;padding-bottom: 20px;text-align: center; font-size: large;font-weight: bold;color: #5F89C7;">  
                <i class="material-icons">delete</i></div>
                </div>
                `)
            }

            }, function (tx, error) {
            swal.fire('資料庫錯誤:' + error.message);
        });

    }, function (error) {
        console.log('Transaction ERROR: ' + error.message);
    }, function () {
        console.log('Query database OK')

        
    })
}


const add_customDeck = function(){
    let newUUID = generateUUID()

    Swal.fire({
        title: '新增自訂字卡堆',
        input: 'text',
        inputAttributes: {
          autocapitalize: 'off'
        },
        showCancelButton: false,
        confirmButtonText: '新增',
        showLoaderOnConfirm: true,
        preConfirm: (inputText) => {
            console.log(inputText)
            if(inputText!=''){
            db.transaction(function (tx) {
                 
                tx.executeSql('INSERT INTO customdeck (deckId,deckName) VALUES (?,?)', [newUUID,inputText], function (tx, rs) {


                    }, function (tx, error) {
                    swal.fire('資料庫錯誤:' + error.message);
                });

            }, function (error) {
                console.log('Transaction ERROR: ' + error.message);
            }, function () {
                console.log('insert database OK')
                $('#div_customDeckList').append(`
                <div class="row" style="margin-bottom: 0;border-bottom: 1px solid #e1f2ff;">
                <div class="col s2" style="padding-top: 20px;padding-bottom: 20px;text-align: center; font-size: large;font-weight: bold;color: #5F89C7;">
                    <img style="height:15px;" src="./img/main/right_arrow.png">
                </div><a href="customDeckDetail.html?deckId=${newUUID}&deckName=${inputText}">
                <div class="col s8" style="padding-top: 20px;padding-bottom: 20px;padding-left: 0px;word-break: break-all;color: #5F89C7;font-weight: 500;">
                    ${inputText}
                </div></a>
                <div class="col s2" onclick="javascript:del_customDeckById('${newUUID}','${inputText}')" style="padding-top: 20px;padding-bottom: 20px;text-align: center; font-size: large;font-weight: bold;color: #5F89C7;">  
                <i class="material-icons">delete</i></div>
                </div>
                `)
                
            })
            
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: '請輸入自訂卡堆名稱'
                  })
            }
        },
        allowOutsideClick: () => !Swal.isLoading()
      }).then((result) => {
        

      })
}


const del_customDeckById = function(deckId,deckName){
    console.log(deckId)
    Swal.fire({
        title: '確定刪除?',
        text: deckName,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: '確認'
      }).then((result) => {
        if (result.isConfirmed) {
            db.transaction(function (tx) {
                 
                tx.executeSql('DELETE FROM customdeck WHERE deckId = ?', [deckId], function (tx, rs) {

                    }, function (tx, error) {
                    swal.fire('資料庫錯誤:' + error.message);
                });

                tx.executeSql('DELETE FROM customdecklist WHERE deckId = ?', [deckId], function (tx, rs) {
                    
                }, function (tx, error) {
                swal.fire('資料庫錯誤:' + error.message);
            });

            }, function (error) {
                console.log('Transaction ERROR: ' + error.message);
            }, function () {
                Swal.fire(
                    '已刪除!',
                    `卡堆: ${deckName} `,
                    'success'
                  ).then(()=>{
                      window.location.reload()
                  })
            })


        }
      })
}