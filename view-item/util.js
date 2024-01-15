
const se = new URLSearchParams(window.location.search);
var id = se.get('productid');
var colorParam = se.get('c');
var labelID = se.get('l');
var deviceId = window.navigator.userAgent.replace(/\D/g, '');
var keywordsString = [];
var wishlistCounter = 0;
var startTitle = "0";

if (!labelID) {
    labelID = 0;
}
if (!colorParam) {
    colorParam = 0;
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


function refreshPage(id, pos) {
    window.location.href = "/shop-details/?productid=" + id + "&l=" + pos;
}

if (!id) {
    window.location.href = '/NOPRODUCTFOUND';
} else {


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
            if (wishlistArray.includes(id)) {
                document.getElementById('btn-wl').className = 'wishlist-btn-active';
                document.getElementById('btn-wl').innerHTML = '<i class="icon-heart"></i> WISHLISTED';
            } else {
                document.getElementById('btn-wl').className = 'wishlist-btn';
                document.getElementById('btn-wl').innerHTML = '<i class="icon-heart"></i> ADD TO WISHLIST';
            }
        }).catch(error => {

        });

    var zoomThumb = new Swiper('.zoom-thumbs-2', {
        spaceBetween: 20,
        slidesPerView: 8,
        direction: 'vertical',
    });
    var zoomTop = new Swiper('.zoom-top-2', {
        spaceBetween: 0,
        loop: true,
        thumbs: {
            swiper: zoomThumb
        }
    });
    function refreshWithColor(element) {
        if (!labelID) {
            window.location.href = "?productid=" + id + "&c=" + element.value;
        } else {
            window.location.href = "?productid=" + id + "&l=" + labelID + "&c=" + element.value;
        }
    }
    function refreshWithSize(element) {
        if (!colorParam) {
            window.location.href = "?productid=" + id + "&l=" + element.value;
        } else {
            window.location.href = "?productid=" + id + "&c=" + colorParam + "&l=" + element.value;
        }
    }
    //Fetch Title
    const firestore1 = app.firestore();
    const productDetailsRef = firestore1.collection("site/tls/products").doc(id);

    productDetailsRef.get()
        .then((doc) => {
            const data = doc.data();
            if (data == null) {
                window.location.href = '/NOPRODUCTFOUND';
            } else {
                document.getElementById('buffer').style.display = 'none';

                document.getElementById('title-txt').textContent = data.title;
                const maxWidth = window.innerWidth;

                startTitle = (maxWidth > 994) ? data.title : 0;
                document.getElementById('cat-txt').textContent = data.categories;
                document.getElementById('product-description').innerHTML = data.description;

                keywordsString = data.keywords;
                if (data.varients[labelID].offerprice == "") {
                    document.getElementById('offer-price').textContent = "₹" + data.varients[labelID].price;
                } else {
                    document.getElementById('offer-price').textContent = "₹" + data.varients[labelID].offerprice;
                    document.getElementById('offer-price').innerHTML = document.getElementById('offer-price').innerHTML + `<small
                                            style="text-decoration:line-through; color:#D32F2F; font-size:24px; margin-left:10px"
                                            id="price">₹${data.varients[labelID].price}</small>`;
                }
                var thumbSelector = document.getElementById('thumb-selector');
                var thumbSelectorTemplate = "";

                if (colorParam <= data.colorVarients.length) {

                    for (let i = 0; i < data.colorVarients[colorParam].source.length; i++) {
                        thumbSelectorTemplate = `
                        <div class="swiper-slide">
                            <img class="img-responsive m-auto"
                                src="${data.colorVarients[colorParam].source[i].url}" alt="">
                        </div>
                        `;
                        thumbSelector.innerHTML = thumbSelector.innerHTML + thumbSelectorTemplate;
                        zoomThumb.update();
                        var thumbSwiper = document.getElementById('thumb-swiper');
                        var thumbSwiperTemplate = "";
                    }
                    for (let i = 0; i < data.colorVarients[colorParam].source.length; i++) {
                        thumbSwiperTemplate = `
                        <div class="swiper-slide">
                            <img class="img-responsive m-auto"
                                src="${data.colorVarients[colorParam].source[i].url}" alt="">
                            <a class="venobox full-preview" data-gall="myGallery"
                                href="${data.colorVarients[colorParam].source[i].url}">
                                <i class="fa fa-arrows-alt" aria-hidden="true"></i>
                            </a>
                        </div>
                        `;
                        thumbSwiper.innerHTML = thumbSwiper.innerHTML + thumbSwiperTemplate;
                        zoomTop.update();

                    }

                } else {
                    for (let i = 0; i < data.images.length; i++) {
                        thumbSelectorTemplate = `
                        <div class="swiper-slide">
                            <img class="img-responsive m-auto"
                                src="${data.images[i]}" alt="">
                        </div>
                        `;
                        thumbSelector.innerHTML = thumbSelector.innerHTML + thumbSelectorTemplate;
                        zoomThumb.update();
                        var thumbSwiper = document.getElementById('thumb-swiper');
                        var thumbSwiperTemplate = "";
                    }
                    for (let i = 0; i < data.images.length; i++) {
                        thumbSwiperTemplate = `
                        <div class="swiper-slide">
                            <img class="img-responsive m-auto"
                                src="${data.images[i]}" alt="">
                            <a class="venobox full-preview" data-gall="myGallery"
                                href="${data.images[i]}">
                                <i class="fa fa-arrows-alt" aria-hidden="true"></i>
                            </a>
                        </div>
                        `;
                        thumbSwiper.innerHTML = thumbSwiper.innerHTML + thumbSwiperTemplate;
                        zoomTop.update();

                    }
                }

                var thumbSwiper = document.getElementById('thumb-swiper');
                var thumbSwiperTemplate = "";
                for (let i = 0; i < data.colorVarients[Number(colorParam)].source.length; i++) {
                    thumbSwiperTemplate = `
                        <div class="swiper-slide">
                            <img class="img-responsive m-auto"
                                src="${data.colorVarients[Number(colorParam)].source[i].url}" alt="">
                            <a class="venobox full-preview" data-gall="myGallery"
                                href="${data.colorVarients[Number(colorParam)].source[i].url}">
                                <i class="fa fa-arrows-alt" aria-hidden="true"></i>
                            </a>
                        </div>
                    `;
                    thumbSwiper.innerHTML = thumbSwiper.innerHTML + thumbSwiperTemplate;
                    zoomTop.update();
                }

                var colorWrapper = document.getElementById('color-wrapper');
                for (let i = 0; i < data.colorVarients.length; i++) {
                    var colorTemplate = `
                    <option value="${i}" style="text-transform: capitalize;" ${colorParam == i ? 'selected' : ''}>${data.colorVarients[i].label}</option>
                    `;
                    colorWrapper.innerHTML += colorTemplate;

                }
                var sizeWrapper = document.getElementById('size-wrapper');
                for (let i = 0; i < data.varients.length; i++) {
                    var sizeTemplate = `
                    <option value="${i}" style="text-transform: capitalize;" ${labelID == i ? 'selected' : ''}>${data.varients[i].label}</option>
                    `;
                    sizeWrapper.innerHTML += sizeTemplate;

                }

                const firestore2 = firebase.firestore();
                const collectionRef = firestore2.collection('site/tls/products');

                var relatedPr = document.getElementById('related-pr');
                for (let j = 0; j < keywordsString.length; j++) {
                    for (let i = 0; i < keywordsString.length; i++) {
                        if (keywordsString[i].length > 25 || keywordsString[i] == "" || keywordsString[i] == keywordsString[j]) {
                            keywordsString.splice(i, 1);
                        }
                    }
                }
                collectionRef
                    .orderBy('title')
                    .limit(15)
                    .get()
                    .then(querySnapshot => {
                        querySnapshot.forEach(doc => {
                            // Access the data from each document
                            const data = doc.data();
                            var productList = document.getElementById('product-lists');
                            // Create the outer div
                            var productTemplate = `
                            <div class="swiper-slide">
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
                                        <button title="Add To Cart" class="action cust-add-to-cart" onclick="document.getElementById('cart-btn').click();addToCart('${doc.id}');"><i
                                            class="pe-7s-shopbag" style="margin-right: 4px;"></i>Add to cart</button>
                                        <button class="action cust-wishlist" title="Wishlist" onclick="addToWishlist('${doc.id}',this)"><i
                                                class="pe-7s-like"></i></button>
                                    </div>
                                </div>
                            </div>`;
                            productList.innerHTML = productTemplate + productList.innerHTML;
                            var productSlider = new Swiper('.new-product-slider.swiper-container', {
                                slidesPerView: 4,
                                spaceBetween: 30,
                                speed: 1500,
                                loop: false,

                                // Navigation arrows

                                navigation: {
                                    nextEl: ".swiper-button-next",
                                    prevEl: ".swiper-button-prev",
                                },

                                breakpoints: {
                                    0: {
                                        slidesPerView: 1,
                                    },
                                    478: {
                                        slidesPerView: 1,
                                    },
                                    576: {
                                        slidesPerView: 2,
                                    },
                                    768: {
                                        slidesPerView: 2,
                                    },
                                    992: {
                                        slidesPerView: 3,
                                    },
                                    1200: {
                                        slidesPerView: 4,
                                    },
                                },
                            });
                            productSlider.update();
                        });
                    })
                    .catch(error => {
                        console.error('Error getting documents: ', error);
                        document.getElementById('error-alert').style.top = '50px';
                    });
            }
        }).catch(error => {
            console.error('Error getting documents: ', error);
            document.getElementById('error-alert').style.top = '50px';
        });


}


function addToWishlist(id) {

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
                    document.getElementById('btn-wl').className = 'wishlist-btn';
                    document.getElementById('btn-wl').innerHTML = '<i class="icon-heart"></i> ADD TO WISHLIST';
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
                document.getElementById('btn-wl').className = 'wishlist-btn-active';
                document.getElementById('btn-wl').innerHTML = '<i class="icon-heart"></i> WISHLISTED';

            })
            .catch((error) => {

            });
    }
}