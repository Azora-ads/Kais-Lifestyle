
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


wishlistArray = [];



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


const firebaseConfig = decryptConfig({ "YXBpS2V5": "QUl6YVN5Q1YxWjgtRVpXZFV3UG5zQWlQclJuNmhTY2J0OV9Bbkhz", "YXV0aERvbWFpbg==": "a2Fpc29ubGluZS5maXJlYmFzZWFwcC5jb20=", "cHJvamVjdElk": "a2Fpc29ubGluZQ==", "c3RvcmFnZUJ1Y2tldA==": "a2Fpc29ubGluZS5hcHBzcG90LmNvbQ==", "bWVzc2FnaW5nU2VuZGVySWQ=": "MTAzODM4NDU2NjEyNg==", "YXBwSWQ=": "MToxMDM4Mzg0NTY2MTI2OndlYjowYTJkYWIyMmE5MGM3NTAwNjZiYjdm", "bWVhc3VyZW1lbnRJZA==": "Ry0zMzZTVEtDNUhR" });
const app = firebase.initializeApp(firebaseConfig);


const wishlistGet = app.firestore();
wishlistGet.collection("site/tls/wishlists").doc(uniqueDeviceId)
    .get()
    .then((doc) => {
        document.getElementById('buffer').style.display = 'none';

        const data = doc.data();
        wishlistArray = data.docids;
        for (let i = 0; i < wishlistArray.length; i++) {
            const firestore1 = app.firestore();
            const productDetailsRef = firestore1.collection("site/tls/products").doc(wishlistArray[i]);
            productDetailsRef.get()
                .then((doc) => {
                    const data = doc.data();
                    if (data != null) {
                        var wishlistTemplate = `
                                        <tr class="cart-wishlist-item">
                                            <td class="product-remove">
                                                <button style="border:none; border-radius:8px; margin-right:20px;" onclick = "removeFromWishlist('${doc.id}')"><i class="fa fa-trash-o"></i></button>
                                            </td>
                                            <td class="product-thumb">
                                                <a href="/view-item/?productid=${doc.id}">
                                                    <img src="${data.images[0]}" width="90"
                                                        height="110" alt="Image-HasTech">
                                                </a>
                                            </td>
                                            <td class="product-name">
                                                <h4 class="title"><a href="/view-item/?productid=${doc.id}">${data.title}</a>
                                                </h4>
                                            </td>
                                            <td class="product-stock-status">
                                                <span class="stock">In Stock</span>
                                            </td>
                                            <td class="product-price">
                                                <span class="price">₹${(data.varients[0].offerprice == "") ? data.varients[0].price : data.varients[0].offerprice}</span>
                                            </td>
                                            <td class="product-action">
                                                <a class="btn-cart" href="/my-cart/">Add to cart</a>
                                            </td>
                                        </tr>
                                        
                       `;
                        document.getElementById('w-body').innerHTML = document.getElementById('w-body').innerHTML + wishlistTemplate;


                    }
                });


        }
    }).catch(error => {

    });



function removeFromWishlist(id) {
    const indexToRemove = wishlistArray.indexOf(id);

    if (indexToRemove != -1) {
        wishlistArray.splice(indexToRemove, 1);
        const wishlistRef = firebase.firestore();
        const data = {
            docids: wishlistArray,
        };
        wishlistRef.collection("site/tls/wishlists").doc(uniqueDeviceId)
            .set(data, { merge: true })
            .then((docRef) => {
                window.location.href = '/my-wishlist/';
            })
            .catch((error) => {

            });
    }
}