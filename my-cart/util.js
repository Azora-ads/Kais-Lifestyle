function getOrCreateDeviceId() {
    let deviceId = localStorage.getItem('deviceId');

    if (!deviceId) {
        deviceId = generateUUID();
        localStorage.setItem('deviceId', deviceId);
    }

    return deviceId;
}

function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

const uniqueDeviceId = getOrCreateDeviceId();

var myCartItems = [];

function decryptConfig(encryptedConfig) {
    let decryptedConfig = {};

    for (const encryptedKey in encryptedConfig) {
        if (encryptedConfig.hasOwnProperty(encryptedKey)) {
            const key = atob(encryptedKey);
            const value = atob(encryptedConfig[encryptedKey]);
            decryptedConfig[key] = value;
        }
    }
    return decryptedConfig;
}
var newCartObject = {};
var fbConfig = decryptConfig({ "YXBpS2V5": "QUl6YVN5Q1YxWjgtRVpXZFV3UG5zQWlQclJuNmhTY2J0OV9Bbkhz", "YXV0aERvbWFpbg==": "a2Fpc29ubGluZS5maXJlYmFzZWFwcC5jb20=", "cHJvamVjdElk": "a2Fpc29ubGluZQ==", "c3RvcmFnZUJ1Y2tldA==": "a2Fpc29ubGluZS5hcHBzcG90LmNvbQ==", "bWVzc2FnaW5nU2VuZGVySWQ=": "MTAzODM4NDU2NjEyNg==", "YXBwSWQ=": "MToxMDM4Mzg0NTY2MTI2OndlYjowYTJkYWIyMmE5MGM3NTAwNjZiYjdm", "bWVhc3VyZW1lbnRJZA==": "Ry0zMzZTVEtDNUhR" });
let unAssigned = { databaseURL: "https://kaisonline-default-rtdb.asia-southeast1.firebasedatabase.app" }
Object.assign(fbConfig, unAssigned);
const cartApp = firebase.initializeApp(fbConfig, 'secondary');
const cartDB = cartApp.database();
const checkOutRef = cartDB.ref(uniqueDeviceId + '/tls/Checkouts');
const cartRef = cartDB.ref(uniqueDeviceId + '/tls/MyCarts');
var tbody = document.getElementById('table-body');
function fetchInitialData() {
    cartRef.once('value')
        .then(function (snapshot) {
            document.getElementById('buffer').style.display = 'none';
            snapshot.forEach(function (childSnapshot) {
                var returnData = childSnapshot.val();
                const cartlistRef = cartApp.firestore();
                cartlistRef.collection("site/tls/products").doc(returnData.prid)
                    .get()
                    .then((doc) => {
                        const data = doc.data();
                        var cartListTemplateMain = `
                                            <tr class="cart-product-item" id="'row-${doc.id}-${returnData.labelid}-${returnData.colorid}">
                                                <td>
                                                    <button style="border:none; border-radius:8px; margin-right:20px;" onclick="removeFromCart('${doc.id}','${returnData.labelid}','${returnData.colorid}');"><i class="fa fa-trash-o"></i></button>
                                                </td>
                                                <td class="product-thumb">
                                                    <a href="/view-item/?productid=${doc.id}&l=${returnData.labelid}&c=${returnData.colorid}">
                                                        <img src="${data.colorVarients[returnData.colorid].source[0].url}" width="90"
                                                            height="110" alt="">
                                                    </a>
                                                </td>
                                                <td class="product-name">
                                                    <h4 class="title"><a href="/view-item/?productid=${doc.id}&l=${returnData.labelid}&c=${returnData.colorid}">${data.title}</a></h4>
                                                </td>
                                                <td class="product-price">
                                                    <span class="price">₹${(data.varients[returnData.labelid].offerprice == "") ? data.varients[returnData.labelid].price : data.varients[returnData.labelid].offerprice}</span>
                                                </td>
                                                <td class="product-quantity">
                                                    <div class="pro-qty">
                                                        <span>${returnData.quantity}</span>
                                                    </div>
                                                </td>
                                                <td class="product-subtotal">
                                                    <span class="price">${Number((data.varients[returnData.labelid].offerprice == "") ? data.varients[returnData.labelid].price : data.varients[returnData.labelid].offerprice) * returnData.quantity}</span>
                                                </td>
                                            </tr>
                        `;
                        tbody.innerHTML = cartListTemplateMain + tbody.innerHTML;

                        newCartObject = {
                            productid: returnData.prid,
                            productLabelId: returnData.labelid,
                            quantity: returnData.quantity,
                            productTitle: data.title,
                            label: data.varients[returnData.labelid].label,
                            imageUrl: data.colorVarients[returnData.colorid].source[0].url,
                            colorId: returnData.colorid,
                            price: (data.varients[returnData.labelid].offerprice == "") ? data.varients[returnData.labelid].price : data.varients[returnData.labelid].offerprice * Number(returnData.quantity)
                        };
                        myCartItems.push(newCartObject);

                    })
                    .catch((error) => {
                    });
            });
        })
        .catch(function (error) {
            console.error('Error fetching initial data:', error);
            document.getElementById('error-alert').style.top = '50px';

        });
}

function removeFromCart(docid, la, co) {
    const delChildRef = cartRef.child(docid + "?" + la + "?" + co);
    delChildRef.remove()
        .then(() => {
            location.reload();
        })
        .catch((error) => {
            console.error(`Error removing item: ${error.message}`);
        });
}

fetchInitialData()

/*
function updateTot(docid, lblid, quant, unitpr) {
    var uptxt = document.getElementById('tot-amount-' + docid + '-' + lblid);
    uptxt.innerHTML = '₹' + (Number(unitpr) * Number(quant));
    for (let i = 0; i < myCartItems.length; i++) {
        if (docid == myCartItems[i].productid && lblid == myCartItems[i].productLabelId) {
            myCartItems[i].price = Number(unitpr) * Number(quant);
            myCartItems[i].quantity = quant;
        }
    }
    updateCheckoutPrice();
}

function updateCheckoutPrice() {
    var tot_sum = 0;
    if (myCartItems.length != 0) {
        for (let i = 0; i < myCartItems.length; i++) {
            tot_sum = tot_sum + Number(myCartItems[i].price);
        }
        document.getElementById('price-sub-tot').innerHTML = '₹' + tot_sum;
        gst_sum = (tot_sum / 100) * 8;
        document.getElementById('price-gst').innerHTML = '₹' + gst_sum;
        total = tot_sum + gst_sum;
        document.getElementById('price-tot').innerHTML = '₹' + total;
    }
}*/
function proceedCheckout() {
    for (let i = 0; i < myCartItems.length; i++) {
        checkOutRef
            .child(i)
            .update(myCartItems[i])
            .then(snapshot => {
                window.location.href = '/checkout/';
            })
            .catch(error => {
                console.error("Error:", error);
            });

    }
}
