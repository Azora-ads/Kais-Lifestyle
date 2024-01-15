
const nse = new URLSearchParams(window.location.search);

//document.getElementById('cart-qnty-1')
document.getElementById('cart-counter-1').textContent = 0;


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

var myCarts = [];

var myCartsPrices = [];

var fbConfig = decryptConfig({ "YXBpS2V5": "QUl6YVN5Q1YxWjgtRVpXZFV3UG5zQWlQclJuNmhTY2J0OV9Bbkhz", "YXV0aERvbWFpbg==": "a2Fpc29ubGluZS5maXJlYmFzZWFwcC5jb20=", "cHJvamVjdElk": "a2Fpc29ubGluZQ==", "c3RvcmFnZUJ1Y2tldA==": "a2Fpc29ubGluZS5hcHBzcG90LmNvbQ==", "bWVzc2FnaW5nU2VuZGVySWQ=": "MTAzODM4NDU2NjEyNg==", "YXBwSWQ=": "MToxMDM4Mzg0NTY2MTI2OndlYjowYTJkYWIyMmE5MGM3NTAwNjZiYjdm", "bWVhc3VyZW1lbnRJZA==": "Ry0zMzZTVEtDNUhR" });

let unAssigned = { databaseURL: "https://kaisonline-default-rtdb.asia-southeast1.firebasedatabase.app" }
Object.assign(fbConfig, unAssigned);

const cartApp = firebase.initializeApp(fbConfig, 'secondary');

const cartDB = cartApp.database();
const cartRef = cartDB.ref(uDeviceId + '/tls/MyCarts');


var i = 0;

var cartLists = document.getElementById('cart-lists-navbar');

function fetchInitialData() {
    cartRef.once('value')
        .then(function (snapshot) {
            i = 0;
            document.getElementById('cart-counter-1').textContent = i;

            snapshot.forEach(function (childSnapshot) {
                i = i + 1;
                document.getElementById('cart-counter-1').textContent = i;
                var returnData = childSnapshot.val();

                //if (nse.get('productid') == returnData.prid && nse.get('l') == returnData.labelid && nse.get('c') == returnData.colorid) {
                //    document.getElementById('add-cart-btn').textContent = 'Added';
                //}
                const cartlistRef = cartApp.firestore();
                console.log(returnData);
                cartlistRef.collection("site/tls/products").doc(returnData.prid)
                    .get()
                    .then((doc) => {
                        const data = doc.data();
                        var cartlistTemplate = `
                    
                     <li id="child-${doc.id}-${returnData.labelid}-${returnData.colorid}">
                            <a href="/view-item/?productid=${doc.id}&l=${returnData.labelid}&c=${returnData.colorid}" class="image"><img src="${data.colorVarients[returnData.colorid].source[0].url}" alt="Cart product Image"></a>
                            <div class="content">
                                <a href="/view-item/?productid=${doc.id}" class="title">${data.title}</a>
                                <span class="quantity-price"><span class="amount">₹${(data.varients[returnData.labelid].offerprice == "") ? data.varients[returnData.labelid].price : data.varients[returnData.labelid].offerprice}</span></span>
                                <button class="remove" onclick="removeFromCart('${doc.id}','${returnData.labelid}','${returnData.colorid}')">×</button>
                            </div>
                        </li>
                    `;
                        let newObjectPrice = {
                            id: doc.id,
                            labelid: returnData.labelid,
                            price: (data.varients[returnData.labelid].offerprice == "") ? data.varients[returnData.labelid].price : data.varients[returnData.labelid].offerprice,
                            qty: returnData.quantity,
                            colorid: returnData.colorid
                        }
                        myCartsPrices.push(newObjectPrice);
                        cartLists.innerHTML = cartlistTemplate + cartLists.innerHTML;
                    })
                    .catch((error) => {

                    });
            });
        })
        .catch(function (error) {
            console.error('Error fetching initial data:', error);
        });
}

fetchInitialData();

function removeFromCart(docid, la, co) {
    const delChildRef = cartRef.child(docid + "?" + la + "?" + co);
    delChildRef.remove()
        .then(() => {
            for (let i = 0; i < myCartsPrices.length; i++) {
                if (myCartsPrices[i].id == docid && myCartsPrices[i].labelid == la && myCartsPrices[i].colorid == co) {
                    myCartsPrices.splice(i, 1);
                    document.getElementById('child-' + docid + '-' + la + '-' + co).style.display = 'none';
                    document.getElementById('cart-counter-1').textContent = Number(document.getElementById('cart-counter-1').textContent) - 1;
                }

            }
        })
        .catch((error) => {
            console.error(`Error removing item: ${error.message}`);
        });
}

function addToCart(id, qty, labelid, co, self) {
    subt = 0;
    cartRef
        .child(id + "?" + labelid + "?" + co)
        .set({
            prid: id,
            quantity: qty,
            labelid: labelid,
            colorid: co
        });
    i = 0;
    cartRef.on('child_added', function (childSnapshot) {
        self.textContent = "Added";
        var returnData = childSnapshot.val();
        cartLists.innerHTML = '';
        document.getElementById('cart-btn').click();
        const cartlistRef = firebase.firestore();
        cartlistRef.collection("site/tls/products").doc(returnData.prid)
            .get()
            .then((doc) => {
                const data = doc.data();
                var cartlistTemplate = `
                    <li id="child-${doc.id}-${returnData.labelid}-${returnData.colorid}">
                            <a href="/view-item/?productid=${doc.id}&l=${returnData.labelid}&c=${returnData.colorid}" class="image"><img src="${data.colorVarients[returnData.colorid].source[0].url}" alt="Cart product Image"></a>
                            <div class="content">
                                <a href="/view-item/?productid=${doc.id}" class="title">${data.title}</a>
                                <span class="quantity-price"><span class="amount">₹${(data.varients[returnData.labelid].offerprice == "") ? data.varients[returnData.labelid].price : data.varients[returnData.labelid].offerprice}</span></span>
                                <button class="remove" onclick="removeFromCart('${doc.id}','${returnData.labelid}','${returnData.colorid}')">×</button>
                            </div>
                        </li>
                    `;
                cartLists.innerHTML = cartlistTemplate + cartLists.innerHTML;

                if (!myCarts.includes(returnData.prid + "?" + returnData.labelid + "?" + returnData.colorid)) {
                    let newObjectPrice = {
                        id: doc.id,
                        labelid: returnData.labelid,
                        price: (data.varients[returnData.labelid].offerprice == "") ? data.varients[returnData.labelid].price : data.varients[returnData.labelid].offerprice,
                        qty: returnData.quantity,
                        colorid: returnData.colorid
                    }
                    myCartsPrices.push(newObjectPrice);
                }

            })
            .catch((error) => {

            });

        if (!myCarts.includes(returnData.prid + "?" + returnData.labelid + "?" + returnData.colorid)) {
            document.getElementById('cart-btn').click();
            myCarts.push(returnData.prid + "?" + returnData.labelid + "?" + returnData.colorid);
            document.getElementById('cart-counter-1').textContent = myCarts.length;
        }


    });
    cartRef.on('child_changed', function (childSnapshot) {
        var returnData = childSnapshot.val();
        document.getElementById('cart-btn').click();
        document.getElementById('cart-counter-1').textContent = myCarts.length;
    });

}