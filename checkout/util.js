
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
var uDeviceId = getOrCreateDeviceId();
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
var fbConfig = decryptConfig({ "YXBpS2V5": "QUl6YVN5Q1YxWjgtRVpXZFV3UG5zQWlQclJuNmhTY2J0OV9Bbkhz", "YXV0aERvbWFpbg==": "a2Fpc29ubGluZS5maXJlYmFzZWFwcC5jb20=", "cHJvamVjdElk": "a2Fpc29ubGluZQ==", "c3RvcmFnZUJ1Y2tldA==": "a2Fpc29ubGluZS5hcHBzcG90LmNvbQ==", "bWVzc2FnaW5nU2VuZGVySWQ=": "MTAzODM4NDU2NjEyNg==", "YXBwSWQ=": "MToxMDM4Mzg0NTY2MTI2OndlYjowYTJkYWIyMmE5MGM3NTAwNjZiYjdm", "bWVhc3VyZW1lbnRJZA==": "Ry0zMzZTVEtDNUhR" });
let unAssigned = { databaseURL: "https://kaisonline-default-rtdb.asia-southeast1.firebasedatabase.app" }
Object.assign(fbConfig, unAssigned);
const cartApp = firebase.initializeApp(fbConfig, 'secondary');
const cartDB = cartApp.database();
var subtotal = 0;
const cartRef = cartDB.ref(uDeviceId + '/tls/Checkouts');


var returnData;
var returnDataArray = [];
var tbody = document.getElementById('product-lists');
function fetchInitialData() {
    cartRef.once('value')
        .then(function (snapshot) {
            document.getElementById('buffer').style.display = 'none';
            snapshot.forEach(function (childSnapshot) {
                returnData = childSnapshot.val();
                returnDataArray.push(returnData);
                var listTemplate = `
                <tr class="cart-item">
                    <td class="product-name">${returnData.productTitle}<span class="product-quantity">×
                            ${returnData.quantity}</span></td>
                    <td class="product-total">₹${returnData.price}</td>
                </tr>
                `;
                subtotal = subtotal + Number(returnData.price);
                tbody.innerHTML = tbody.innerHTML + listTemplate;
                document.getElementById('cart-sub-tot').textContent = '₹' + subtotal;
                document.getElementById('cart-gst').textContent = '₹' + (subtotal / 100) * 8;
                var tot_amount = Number(subtotal) + Number((subtotal / 100) * 8);
                document.getElementById('order-tot').textContent = '₹' + tot_amount;
            });
        })
        .catch(function (error) {
            console.error('Error fetching initial data:', error);
            document.getElementById('error-alert').style.top = '50px';

        });
}

fetchInitialData();

function placeOrder() {
    const name = document.getElementById('nme-input');
    const address1 = document.getElementById('address1-input');
    const address2 = document.getElementById('address2-input');
    const address3 = document.getElementById('address3-input');
    const email = document.getElementById('email-input');
    const phone = document.getElementById('ph-input');

    if (name.value.trim() == "") {
        name.style.border = '1px solid #D32F2F';
        window.location.href = '#error';
    } else {
        if (address1.value.trim() == "") {
            address1.style.border = '1px solid #D32F2F';
            window.location.href = '#error';
        } else {
            if (address3.value.trim() == "") {
                address3.style.border = '1px solid #D32F2F';
                window.location.href = '#error';
            } else {
                if (phone.value.trim() == "") {
                    phone.style.border = '1px solid #D32F2F';
                    window.location.href = '#error';
                } else {
                    if (returnDataArray.length != 0) {
                        const orderRef = cartDB.ref('tls/Orders').push();
                        var fbkey = orderRef.key;
                        var recData = {
                            orderId: fbkey,
                            data: returnDataArray,
                            userid: uDeviceId,
                            name: name.value,
                            address1: address1.value,
                            address2: address2.value,
                            address3: address3.value,
                            email: email.value,
                            phone: phone.value,
                            status: '202'
                        };
                        orderRef
                            .set(recData)
                            .then(snapshot => {
                                const orderAdd = cartDB.ref(uDeviceId + '/Orders').push();
                                orderAdd
                                    .set(
                                        {
                                            orderId: fbkey,
                                        }
                                    )
                                    .then(snapshot => {
                                        localStorage.setItem('recdata', JSON.stringify(recData));
                                        window.location.href = 'invoice/';
                                    })
                                    .catch(error => {
                                        console.error("Error:", error);
                                    });
                            })
                            .catch(error => {
                                console.error("Error:", error);
                            });
                    }
                }
            }
        }
    }
}