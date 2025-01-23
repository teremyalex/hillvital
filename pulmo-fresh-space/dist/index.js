"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let cart = [];
let total = 0;
function addToCart(id, name, price, image) {
    let cartItem = cart.find(item => item.id === id);
    if (cartItem) {
        cartItem.qty += 1;
    }
    else {
        cart.push({ id, name, price, qty: 1, image });
    }
    updateCartDisplay();
    cartPopup();
}
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById("kosarTermekek");
    cartItemsContainer.innerHTML = cart.length == 0 ? `<div class="emptyCart"><img src="img/cart.svg"><br>A kosár üres!</div>` : "";
    cart.forEach((item, index) => {
        const newDiv = document.createElement("div");
        newDiv.classList.add("kosar-termek");
        newDiv.innerHTML = `
                <div><img src="img/${item.image}"></div>
                <div>
                    <div class="kosar-termeknev">${item.name}</div>
                    <div class="kosar-termekar">${new Intl.NumberFormat('hu-HU', { useGrouping: true }).format(item.price * item.qty)} Ft</div>
                    <div class="kosar-mennyiseg">
                        <button class="minus-btn" type="button" onclick="changeQuantity(${index}, -1)"><i class="fa-solid fa-minus"></i></button>
                        <input type="text" value="${item.qty}" class="quantity-input" readonly>
                        <button class="plus-btn" type="button" onclick="changeQuantity(${index}, 1)"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
                <button class="x-button" type="button" onclick="removeFromCart(${index})"><i class="fa-solid fa-circle-xmark"></i></button>
            `;
        cartItemsContainer.appendChild(newDiv);
    });
    updateTotalAmount();
}
function changeQuantity(index, change) {
    if (cart[index].qty + change > 0) {
        cart[index].qty += change;
    }
    updateCartDisplay();
}
function removeFromCart(index) {
    document.getElementById('kosarTermekek').children[index].classList.add('remove');
    let height = document.getElementById('kosarTermekek').children[index].clientHeight + 50;
    setTimeout(() => {
        for (let i = index + 1; i < cart.length; i++) {
            document.getElementById('kosarTermekek').children[i].style.transform = 'translateY(-' + height + 'px)';
        }
    }, 200);
    setTimeout(() => {
        cart.splice(index, 1);
        updateCartDisplay();
    }, 500);
}
let totalCount = 0;
function updateTotalAmount() {
    const totalAmountElement = document.getElementById("totalAmount");
    const shippingPrice = document.querySelector('input[name="radio-shipping"]:checked');
    const paymentPrice = document.querySelector('input[name="radio-payment"]:checked');
    total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    total += Number((shippingPrice === null || shippingPrice === void 0 ? void 0 : shippingPrice.dataset.price) || 0) + Number((paymentPrice === null || paymentPrice === void 0 ? void 0 : paymentPrice.dataset.price) || 0);
    if (totalCount != total) {
        totalCount = 0;
        let intervalId = setInterval(() => {
            totalCount += total / 30;
            totalAmountElement.textContent = `${new Intl.NumberFormat('hu-HU', { useGrouping: true }).format(Math.round(totalCount))} Ft`;
            if (totalCount >= total) {
                clearInterval(intervalId);
                totalCount = total;
                totalAmountElement.textContent = total > 0 ? `${new Intl.NumberFormat('hu-HU', { useGrouping: true }).format(total)} Ft` : "";
            }
        }, 10);
    }
    console.log(total);
}
function cartPopup() {
    document.getElementById('succes-cart').classList.add('active');
    setTimeout(function () {
        document.getElementById('succes-cart').classList.remove('active');
    }, 3000);
}
function alertPopup(message) {
    document.getElementById('alert-cart').innerHTML = message;
    document.getElementById('alert-cart').classList.add('active');
    setTimeout(function () {
        document.getElementById('alert-cart').classList.remove('active');
    }, 3000);
}
function postData() {
    if (cart.length === 0) {
        alertPopup('A kosár üres!');
        return;
    }
    for (let i = 0; i < document.querySelectorAll('#theForm input').length; i++) {
        if (!document.querySelectorAll('#theForm input')[i].reportValidity())
            return;
    }
    if (!document.querySelector('input[name="radio-payment"]:checked')) {
        alertPopup('Kérlek válassz a fizetési módok közül!');
        return;
    }
    /*if (!document.querySelector('input[name="radio-shipping"]:checked')) {
        alertPopup('Kérlek válassz a szállítási módok közül!');
        return;
    }
    if (document.querySelector('input[name="radio-shipping"]:checked').value === 'FOXPOST' && document.getElementById('foxpostData').value === '') {
        alertPopup('Kérlek válassz ki egy automatát a listából!');
        return;
    }*/
    let product_ids = [];
    let product_qtys = [];
    cart.forEach((item) => {
        product_ids.push(item.id);
        product_qtys.push(item.qty);
    });
    product_ids.push(260);
    product_qtys.push(1);
    /*if (document.querySelector('input[name="radio-payment"]:checked').value === '1') {
        product_ids.push(244);
        product_qtys.push(1);
    }*/
    function sendData() {
        return __awaiter(this, void 0, void 0, function* () {
            let adat = {
                name: document.getElementById("name").value || "",
                email: document.getElementById("email").value || "",
                phone: document.getElementById("phone").value || "",
                billing_zip: document.getElementById("billing_zip").value || "",
                billing_city: document.getElementById("billing_city").value || "",
                billing_address: document.getElementById("billing_address").value || "",
                shipping_zip: document.getElementById("shipping_zip").value || "",
                shipping_city: document.getElementById("shipping_city").value || "",
                shipping_address: document.getElementById("shipping_address").value || "",
                payment_method_id: document.querySelector('input[name="radio-payment"]:checked').value || "",
                product_id: product_ids,
                product_qty: product_qtys,
                comment: document.getElementById('message').value || "",
                data: {
                    foxpost_automata: document.getElementById('foxpostData').value || "",
                },
                //success_return_url: 'https://rachelcare.hu/koszonjuk.html'
            };
            try {
                let response = yield fetch('https://epikforge.space/api/site/1d863b74-6619-47ee-a51c-a6913d3e90b6/order/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(adat)
                });
                if (!response.ok) {
                    throw new Error('Hálózati hiba történt: ' + response.status);
                }
                let data = yield response.json(); // Válasz feldolgozása JSON-ként
                console.log('Sikeres válasz:', data);
                // @ts-ignore
                fbq('track', 'Purchase', {
                    value: total,
                    currency: 'HUF',
                });
                if (data.redirect && typeof data.redirect === 'string') {
                    window.location = data.redirect;
                }
                //Sikeres rendelés
                if (data.success) {
                    document.getElementById('form').style.opacity = '0';
                    setTimeout(() => {
                        while (document.getElementById('form').firstChild) {
                            document.getElementById('form').removeChild(document.getElementById('form').firstChild);
                        }
                        document.getElementById('form').innerHTML = `
                            <h3>Sikeres rendelés!</h3>
                            <button class="rendeles-gomb" type="button" onclick="location.reload();">Új rendelés leadása</button>
                        `;
                        document.getElementById('form').style.height = '500px';
                        document.getElementById('form').style.opacity = '1';
                    }, 500);
                }
            }
            catch (error) {
                console.error('Hiba:', error.message);
            }
        });
    }
    sendData();
}
function myFunction() {
    if (document.getElementById("myCheck").checked)
        document.getElementById("text").style.display = "block";
    else
        document.getElementById("text").style.display = "none";
}
document.getElementById('osszetevok').addEventListener('click', () => {
    document.getElementById('osszetevok').innerHTML = `<span>Aloe vera, árnika, boróka, citromolaj, diólevél, erdei fenyő, eukaliptusz, fekete nadálytő, kakukkfű, kamilla, körömvirág, kurkuma, levendula, libapimpó, rozmaring, vadgesztenye, ricinus, menta, kámforfa. Egyéb hatóanyagok: A-vitamin, E-vitamin.</span>`;
});
//Foxpost
function receiveMessage(event) {
    if (event.origin !== 'https://cdn.foxpost.hu') {
        return;
    }
    try {
        var apt = JSON.parse(event.data);
        document.getElementById('foxpostData').value = apt.operator_id;
    }
    catch (error) {
        console.error('Hibás üzenet formátum:', error);
    }
}
window.addEventListener('message', receiveMessage, false);
document.querySelectorAll('input[name="radio-shipping"]').forEach(input => {
    input.addEventListener('change', () => {
        if (input.value === 'FOXPOST') {
            document.getElementById('foxpost').style.display = 'block';
        }
        else {
            document.getElementById('foxpost').style.display = 'none';
            document.getElementById('foxpostData').value = '';
        }
    });
});
//ANIMATIONS
const anim = new IntersectionObserver(entries => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add("visible");
            }, 150 * index);
        }
    });
});
anim.observe(document.querySelector('.termek-hero'));
anim.observe(document.querySelector('.biztonsag h3'));
anim.observe(document.querySelector('.garancia h3'));
document.querySelectorAll('.velemenyek > div > div').forEach(entry => anim.observe(entry));
document.querySelectorAll('.termek').forEach(entry => anim.observe(entry));
