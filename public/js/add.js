const storeForm = document.getElementById('store-form');
const storeId = document.getElementById('store-id');
const storeAddress = document.getElementById('store-address');

// Send POST to API to add store
async function addStore(e) {
    e.preventDefault();

    if (storeId.value === '' || storeAddress.value === '') {
        alert("Please enter Store Id and Store Address. Fields cannot be blank.");

    }

    const sendBody = {
        storeId: storeId.value,
        storeAddress: storeAddress.value
    }

    try {
        const res = await fetch('/api/v1/stores', {
            method: 'POST',
            header: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sendBody)
        });

        if (res.status === 400) {
            throw Error('Store already exists!')
        }

        alert('Store added!');
        window.location.href = '/stores'
    } catch (err) {
        alert(err);
        return;
    }
}