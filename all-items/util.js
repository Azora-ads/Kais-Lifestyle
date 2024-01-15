const se = new URLSearchParams(window.location.search);
var keywordsString = se.get('category');
var keywordsArray = [];

var sortValue = se.get('sort');
var searchTxt = se.get('search');
var pageRecent = se.get('previous');
var currentPage = se.get('page');

if (!currentPage) {
    currentPage = 1;
} else {
    if (currentPage < 0) {
        currentPage = 1
    } else if (currentPage == 0) {
        currentPage = 1;
    }
}


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


var searchInput = document.getElementById('search-input');
searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        search();
    }
});

if (searchTxt) {
    searchInput.value = searchTxt;
}

function search() {
    if (keywordsString) {
        if (sortValue) {
            window.location.href = '?category=' + keywordsString + '&sort=' + sortValue + '&search=' + searchInput.value;
        } else {
            window.location.href = '?category=' + keywordsString + '&search=' + searchInput.value;
        }
    } else {
        if (sortValue) {
            window.location.href = '?sort=' + sortValue + '&search=' + searchInput.value;
        } else {
            window.location.href = '?search=' + searchInput.value;
        }
    }
}

var sortPosition = 0;

if (sortValue) {
    var selectElement = document.getElementById("sort-option");

    var selectedValue = sortValue;

    var niceSelect = document.querySelector('.nice-select');
    var options = niceSelect.querySelectorAll('.option');

    for (var i = 0; i < options.length; i++) {
        if (options[i].innerText === selectedValue) {
            sortPosition = i;
            options[i].click();
            document.body.click();

            break;
        }
    }


}

if (keywordsString) {
    keywordsArray = keywordsString.split(',').map(keyword => keyword.trim());
}


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
        const data = doc.data();
        wishlistArray = data.docids;
    }).catch(error => {

    });


const firestore1 = firebase.firestore();

const categoriesRef = firestore1.collection("site/tls/categories");

const categoryWrapper = document.getElementById('categories-lists');

categoriesRef.get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            var cateList = document.createElement('li');
            var catea = document.createElement('a');
            catea.innerHTML = data.caption;
            catea.className = 'selected m-0';
            catea.href = "?category=" + data.category;

            cateList.appendChild(catea);
            categoryWrapper.appendChild(cateList);
        });
    })
    .catch((error) => {
        console.error("Error retrieving Categories: ", error);
    });



const firestore2 = firebase.firestore();
var mainProductsRef = firestore2.collection('site/tls/products');

var startTitle = (pageRecent) ? pageRecent : 0;

if (searchTxt) {
    keywordsArray.push(searchTxt.trim());
}
if (keywordsArray.length > 0) {
    mainProductsRef = mainProductsRef.where('keywords', 'array-contains-any', keywordsArray);
}
if (sortPosition == 2) {
    mainProductsRef = mainProductsRef.orderBy('price', 'desc');

} else if (sortPosition == 1) {
    mainProductsRef = mainProductsRef.orderBy('price');
} else {

}
var firstTitle = pageRecent;
var lastTitle = "0";
var productList = document.getElementById('product-lists');
mainProductsRef
    .orderBy('title')
    .startAfter(startTitle)
    .limit(40)
    .get()
    .then(querySnapshot => {
        document.getElementById('buffer').style.display = 'none';
        querySnapshot.forEach(doc => {
            var data = doc.data();

            lastTitle = data.title;

            document.getElementById('link-previous').href = "javascript:goNext('" + lastTitle + "','previous')";
            document.getElementById('link-next').href = "javascript:goNext('" + lastTitle + "','next')";
            document.getElementById('empty-list').style.display = 'none';

            // Create the outermost div with class 'col-lg-12'
            var productTemplate = `
            <div class="product">
                <span class="badges">
                    <span class="new">${data.label}</span>
                </span>
                <div class="thumb">
                    <a href="/view-item/?productid=${doc.id
                }" class="image">
                        <img src="${data.images[0]}" alt="image of ${data.title}" />
                        <img class="hover-image" src="${data.images[0]}" alt="image of ${data.title}" />
                    </a>
                </div>
                <div class="content">
                    <span class="category"><a href="/all-items/?category=${data.categories}" style="text-transform: capitalize;">${data.categories}</a></span>
                    <h5 class="title" style="text-align:center;"><a href="/view-item/?productid=${doc.id}" style="text-transform: capitalize;">${data.title}
                        </a>
                    </h5>
                    <span class="price">
                        <span class="new">₹${data.varients[0].offerprice == '' ? data.varients[0].price : data.varients[0].offerprice + '<span style="text-decoration:line-through; color:#D32F2F; margin-left:5px;"><small>' + data.varients[0].price + '</small><span>'}</span>
                    </span>
                </div>
                <div class="actions">
                    <button title="Add To Cart" class="action cust-add-to-cart" onclick="addToCart('${doc.id}','1','0','0',this);"><i
                        class="pe-7s-shopbag" style="margin-right: 4px;"></i>Add to cart</button>
                    <button class="action ${(wishlistArray.includes(doc.id)) ? 'cust-wishlist-active' : 'cust-wishlist'}" title="Wishlist" onclick="addToWishlist('${doc.id}',this)"><i
                            class="pe-7s-like"></i></button>
                </div>
            </div>`;
            productList.innerHTML = productTemplate + productList.innerHTML;
            document.getElementById('empty-list').style.display = 'none';
        });
    })
    .catch(error => {
        document.getElementById('error-alert').style.top = '50px';
        console.error('Error getting products: ', error);
    });


document.getElementById('curr').textContent = currentPage;
function goNext(newTitle, page) {
    const currentUrl = new URL(window.location.href);
    const newPrevious = newTitle;
    if (page == "previous") {
        currentPage = currentPage - 1;
    } else {
        currentPage = currentPage + 1;
    }
    currentUrl.searchParams.set('page', currentPage);
    currentUrl.searchParams.set('previous', newPrevious);
    window.location.href = '' + currentUrl.search + "#product-area";
}


function addToWishlist(id, element) {

    if (wishlistArray.includes(id)) {
        const indexToRemove = wishlistArray.indexOf(id);
        if (indexToRemove !== -1) {
            wishlistArray.splice(indexToRemove, 1);
            const wishlistRef = firebase.firestore();
            const data = {
                docids: wishlistArray,
            };
            wishlistRef.collection("site/tls/wishlists").doc(uniqueDeviceId)
                .set(data, { merge: true })
                .then((docRef) => {
                    element.className = 'cust-wishlist';
                })
                .catch((error) => {

                });
        }

    } else {
        wishlistArray.push(id);
        const wishlistRef = firebase.firestore();
        const data = {
            docids: wishlistArray,
        };
        wishlistRef.collection("site/tls/wishlists").doc(uniqueDeviceId)
            .set(data, { merge: true })
            .then((docRef) => {
                element.className = 'cust-wishlist-active';


            })
            .catch((error) => {

            });
    }
}