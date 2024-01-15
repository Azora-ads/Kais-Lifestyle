
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

function decryptConfig(encryptedConfig) {
    let decryptedConfig = {};

    for (const encryptedKey in encryptedConfig) {
        if (encryptedConfig.hasOwnProperty(encryptedKey)) {
            const key = atob(encryptedKey);
            const value = atob(encryptedConfig[encryptedKey]); // Base64 decode the value
            decryptedConfig[key] = value;
        }
    }

    return decryptedConfig;
}

var wishlistArray = [];
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


const db = app.firestore();

const headerRef = db.collection("site/tls/headerslides");

var sliderWrapper = document.getElementById('main-slider');
var heroSlider = new Swiper('.hero-slider.swiper-container', {
    loop: true,
    speed: 2000,
    effect: "fade",
    autoplay: {
        delay: 7000,
        disableOnInteraction: false,
    },
    // Navigation arrows
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    }
});
headerRef.get()
    .then((querySnapshot) => {
        document.getElementById('buffer').style.display = 'none';
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            var slider_template = `
            <div class="hero-slide-item slider-height swiper-slide bg-color1"
                        style="background:linear-gradient(#2196F3,#266bf9)">
                        <div class="container h-100">
                            <div class="row h-100">
                                <div class="col-xl-6 col-lg-6 col-md-6 col-sm-6 align-self-center sm-center-view" style="padding:0;">
                                    <div class="hero-slide-content slider-animated-1 header-cont">
                                        <span class="category">${data.caption}</span>
                                        <h2 class="title-1" style="width:70vw">${data.title}</h2>
                                        <a href="/view-item/?productid=${data.productid}" class="btn btn-primary text-capitalize">${data.button}</a>
                                    </div>
                                </div>
                                <div
                                    class="col-xl-6 col-lg-6 col-md-6 col-sm-6 d-flex justify-content-center position-relative align-items-top img-container">
                                    <div class="show-case">
                                        <div class="hero-slide-image">
                                            <img src="${data.image}" alt="" class="img-slider-layout"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
            `;


            sliderWrapper.innerHTML = slider_template + sliderWrapper.innerHTML;
            heroSlider.update();
        });
    })
    .catch((error) => {
        document.getElementById('error-alert').style.top = '50px';
        console.error("Error retrieving Categories: ", error);
    });


const arrRef = db.collection("site/tls/products");
const arrivalWrapper = document.getElementById('newarrival-layout');


arrRef
    .orderBy(firebase.firestore.FieldPath.documentId(), "desc")
    .limit(40)
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            var newArrivalTemplate = `
            <div class="product">
                <span class="badges">
                    <span class="new">${data.label}</span>
                </span>
                <div class="thumb">
                    <a href="/view-item/?productid=" class="image">
                        <img src="${data.images[0]}" alt="image of ${data.title}" />
                        <img class="hover-image" src="${data.images[0]}" alt="image of ${data.title}" />
                    </a>
                </div>
                <div class="content">
                    <span class="category"><a href="/all-items/?category=${data.categories}" style="text-transform: capitalize;">${data.categories}</a></span>
                    <h5 class="title"><a href="/view-item/?productid=${doc.id}" style="text-transform: capitalize;">${data.title}
                        </a>
                    </h5>
                    <span class="price">
                        <span class="new">₹${data.varients[0].offerprice == '' ? data.varients[0].price : data.varients[0].offerprice + '<span style="text-decoration:line-through; color:#D32F2F; margin-left:5px;"><small>' + data.varients[0].price + '</small><span>'}</span>
                    </span>
                </div>
                <div class="actions">
                    <button title="Add To Cart" class="action cust-add-to-cart" onclick="addToCart('${doc.id}','1','0','0',this);"><i
                        class="pe-7s-shopbag" style="margin-right: 10px;"></i>Add to cart</button>
                    <button class="action ${(wishlistArray.includes(doc.id)) ? 'cust-wishlist-active' : 'cust-wishlist'}" title="Wishlist" onclick="addToWishlist('${doc.id}',this)"><i
                            class="pe-7s-like"></i></button>
                </div>
            </div>`;
            arrivalWrapper.innerHTML = newArrivalTemplate + arrivalWrapper.innerHTML;
            if (data.varients[0].offerprice != '') {
                document.getElementById('offered-layout').innerHTML = newArrivalTemplate + document.getElementById('offered-layout').innerHTML
            }
        });
    })
    .catch((error) => {
        console.error("Error retrieving Offer Products: ", error);
    });



const blogRef = db.collection("site/tls/blog");
const blogWrapper = document.getElementById('blog-layout');


blogRef
    .get()
    .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            var blogTemplate = `
              <div
                        style="display: inline-block; width: 400px; height: fit-content; margin-right: 20px; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); transition: transform 0.3s ease-in-out;">

                        <div style="width: 100%; height: 200px; overflow: hidden; border-bottom: 2px solid #ddd;">
                            <img src="${data.image}" alt=""
                                style="width: 100%; height: 100%; object-fit: cover; object-fit:cover;">
                        </div>

                        <div style="padding: 15px;">
                            <span style="font-size: 14px; color: #777;"><i class="fa fa-calendar"
                                    aria-hidden="true"></i> 27, Jun
                                2030</span>
                            <h5 style="font-size: 18px; margin-bottom: 10px;">${data.title}</h5>
                            <p>${data.description}
                            </p>
                            <a href="/about-us/"
                                style="display: inline-block; padding: 10px 15px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px;">About
                                Us</a>
                        </div>

                    </div>
              `;

            blogWrapper.innerHTML = blogTemplate + blogWrapper.innerHTML;
        });
    })
    .catch((error) => {
        console.error("Error retrieving Offer Products: ", error);
    });

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