interface Cart {
    id: number;
    name: string;
    price: number;
    qty: number;
    image: string;
}
let cart:Cart[]= [];
let total = 0;

function addToCart(id:number, name:string, price:number, image:string) {
    let cartItem = cart.find(item => item.id === id);
    if (cartItem) {
        cartItem.qty += 1;
    } else {
        cart.push({ id, name, price, qty: 1, image });
    }
    updateCartDisplay();
    cartPopup();
}



function updateCartDisplay() {
    const cartItemsContainer = document.getElementById("kosarTermekek") as HTMLElement
    cartItemsContainer.innerHTML = cart.length == 0 ? `<div class="emptyCart"><img src="img/cart.svg"><br>A kosár üres!</div>`: ""
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

function changeQuantity(index:number, change:number) {
    if (cart[index].qty + change > 0) {
        cart[index].qty += change;
    }
    updateCartDisplay();
}

function removeFromCart(index:number) {
    document.getElementById('kosarTermekek')!.children[index].classList.add('remove');
    let height = document.getElementById('kosarTermekek')!.children[index].clientHeight + 50;
    setTimeout(() => {
        for (let i = index+1; i < cart.length; i++) {
            (document.getElementById('kosarTermekek')!.children[i] as HTMLElement).style.transform = 'translateY(-' + height + 'px)';
        }
    }, 200)
    setTimeout(() => {
        cart.splice(index, 1);
        updateCartDisplay();
    }, 500)
}

let totalCount = 0;
function updateTotalAmount() {
    const totalAmountElement = document.getElementById("totalAmount") as HTMLElement;
    const shippingPrice = document.querySelector<HTMLInputElement>('input[name="radio-shipping"]:checked')
    const paymentPrice = document.querySelector<HTMLInputElement>('input[name="radio-payment"]:checked')
    total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    total += Number(shippingPrice?.dataset.price || 0) + Number(paymentPrice?.dataset.price || 0)
    if(totalCount != total) {
        totalCount = 0;
        let intervalId = setInterval(() => {
            totalCount += total / 30;
            totalAmountElement.textContent = `${new Intl.NumberFormat('hu-HU', {useGrouping: true}).format(Math.round(totalCount))} Ft`;
            if (totalCount >= total) {
                clearInterval(intervalId);
                totalCount = total;
                totalAmountElement.textContent = total > 0 ? `${new Intl.NumberFormat('hu-HU', {useGrouping: true}).format(total)} Ft` : ""
            }
        }, 10)
    }
    console.log(total);
}

function cartPopup() {
    document.getElementById('succes-cart')!.classList.add('active');
    setTimeout(function () {
        document.getElementById('succes-cart')!.classList.remove('active');
    }, 3000);
}

function alertPopup(message:string) {
    document.getElementById('alert-cart')!.innerHTML = message;
    document.getElementById('alert-cart')!.classList.add('active');
    setTimeout(function () {
        document.getElementById('alert-cart')!.classList.remove('active');
    }, 3000);
}


function postData() {
    if (cart.length === 0) {
        alertPopup('A kosár üres!');
        return;
    }

    for (let i = 0; i < document.querySelectorAll<HTMLInputElement>('#theForm input').length; i++) {
        if (!document.querySelectorAll<HTMLInputElement>('#theForm input')[i].reportValidity()) return
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


    let product_ids:number[] = [];
    let product_qtys:number[] = [];

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


    async function sendData() {
        let adat =
            {
                name: (document.getElementById("name") as HTMLInputElement).value || "",
                email: (document.getElementById("email") as HTMLInputElement).value || "",
                phone: (document.getElementById("phone") as HTMLInputElement).value || "",
                billing_zip: (document.getElementById("billing_zip") as HTMLInputElement).value || "",
                billing_city: (document.getElementById("billing_city") as HTMLInputElement).value || "",
                billing_address: (document.getElementById("billing_address") as HTMLInputElement).value || "",
                shipping_zip: (document.getElementById("shipping_zip") as HTMLInputElement).value || "",
                shipping_city: (document.getElementById("shipping_city") as HTMLInputElement).value || "",
                shipping_address: (document.getElementById("shipping_address") as HTMLInputElement).value || "",
                payment_method_id: (document.querySelector('input[name="radio-payment"]:checked') as HTMLInputElement).value || "",
                product_id: product_ids,
                product_qty: product_qtys,
                comment: (document.getElementById('message') as HTMLInputElement).value || "",
                data:
                    {
                        foxpost_automata: (document.getElementById('foxpostData') as HTMLInputElement).value || "",
                    },
                //success_return_url: 'https://rachelcare.hu/koszonjuk.html'
            };

        try {
            let response = await fetch('https://epikforge.space/api/site/1d863b74-6619-47ee-a51c-a6913d3e90b6/order/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(adat)
            });

            if (!response.ok) {
                throw new Error('Hálózati hiba történt: ' + response.status);
            }

            let data = await response.json(); // Válasz feldolgozása JSON-ként
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
            if(data.success){
                document.getElementById('form')!.style.opacity = '0';
                setTimeout(()=>{
                    while (document.getElementById('form')!.firstChild) {
                        document.getElementById('form')!.removeChild(document.getElementById('form')!.firstChild!);
                    }
                    document.getElementById('form')!.innerHTML = `
                            <h3>Sikeres rendelés!</h3>
                            <button class="rendeles-gomb" type="button" onclick="location.reload();">Új rendelés leadása</button>
                        `;
                    document.getElementById('form')!.style.height = '500px';
                    document.getElementById('form')!.style.opacity = '1';
                }, 500)
            }

        } catch (error) {
            console.error('Hiba:', (error as Error).message);
        }
    }

    sendData();
}

function myFunction() {
    if ((document.getElementById("myCheck") as HTMLInputElement).checked) document.getElementById("text")!.style.display = "block"
    else document.getElementById("text")!.style.display = "none"
}

document.getElementById('osszetevok')!.addEventListener('click', () => {
    document.getElementById('osszetevok')!.innerHTML = `<span>Aloe vera, árnika, boróka, citromolaj, diólevél, erdei fenyő, eukaliptusz, fekete nadálytő, kakukkfű, kamilla, körömvirág, kurkuma, levendula, libapimpó, rozmaring, vadgesztenye, ricinus, menta, kámforfa. Egyéb hatóanyagok: A-vitamin, E-vitamin.</span>`;
})


//Foxpost
function receiveMessage(event: MessageEvent) {
    if (event.origin !== 'https://cdn.foxpost.hu') { return; }
    try {
        var apt = JSON.parse(event.data);
        (document.getElementById('foxpostData') as HTMLInputElement).value = apt.operator_id;
    } catch (error) {
        console.error('Hibás üzenet formátum:', error);
    }
}

window.addEventListener('message', receiveMessage, false);

document.querySelectorAll<HTMLInputElement>('input[name="radio-shipping"]').forEach(input=> {
    input.addEventListener('change', ()=> {
        if (input.value === 'FOXPOST') {
            document.getElementById('foxpost')!.style.display = 'block';
        } else {
            document.getElementById('foxpost')!.style.display = 'none';
            (document.getElementById('foxpostData') as HTMLInputElement).value = '';
        }
    });
});

//ANIMATIONS
const anim = new IntersectionObserver(entries => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add("visible")
            }, 150*index)

        }
    })
})
anim.observe(document.querySelector('.termek-hero')!)
anim.observe(document.querySelector('.biztonsag h3')!)
anim.observe(document.querySelector('.garancia h3')!)
document.querySelectorAll('.velemenyek > div > div').forEach(entry => anim.observe(entry))
document.querySelectorAll('.termek').forEach(entry => anim.observe(entry))
