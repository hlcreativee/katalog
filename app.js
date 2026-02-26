// ===============================
// CONFIG
// ===============================
const WHATSAPP_NUMBER = '6289528774815';

// ===============================
// FETCH DATA
// ===============================
async function getCategories() {
    const { data, error } = await window.supabaseClient
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error categories:", error);
        return [];
    }

    return data || [];
}

async function getInvitations() {
    const { data, error } = await window.supabaseClient
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Error invitations:", error);
        return [];
    }

    return data || [];
}

// ===============================
// RENDER FILTER
// ===============================
async function renderFilters() {
    const wrapper = document.querySelector('.filter-wrapper');
    if (!wrapper) return;

    const categories = await getCategories();

    wrapper.innerHTML = `
        <button class="filter-btn active" data-category="all">Semua</button>
    `;

    categories.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = 'filter-btn';
        btn.dataset.category = cat.id;
        btn.textContent = cat.name;
        wrapper.appendChild(btn);
    });

    attachFilterEvents();
}

// ===============================
// FILTER EVENTS
// ===============================
function attachFilterEvents() {
    const buttons = document.querySelectorAll('.filter-btn');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {

            buttons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const categoryId = btn.dataset.category;

            if (categoryId === 'all') {
                renderInvitations();
            } else {
                renderInvitations(categoryId);
            }
        });
    });
}

// ===============================
// RENDER INVITATIONS
// ===============================
async function renderInvitations(categoryId = null) {

    const grid = document.getElementById('invitations-grid');
    const emptyState = document.getElementById('empty-state');

    const categories = await getCategories();
    let invitations = await getInvitations();

    if (categoryId) {
        invitations = invitations.filter(
            inv => String(inv.category_id) === String(categoryId)
        );
    }

    if (invitations.length === 0) {
        grid.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';

    grid.innerHTML = invitations.map(inv => {
        const category = categories.find(c => c.id === inv.category_id);

        return `
            <div class="invitation-card">
                <img src="${inv.image_url}" alt="${inv.title}">
                <h3>${inv.title}</h3>
                <p>${category ? category.name : ''}</p>
                <p>Rp ${Number(inv.price).toLocaleString('id-ID')}</p>

                <!-- Tombol Preview Undangan -->
                <button 
                    onclick="window.open('${inv.demo_url}', '_blank')" 
                    style="
                        background-color:black; 
                        color:white; 
                        border:none; 
                        padding:8px 14px; 
                        border-radius:6px; 
                        cursor:pointer; 
                        margin-right:8px;
                    ">
                    Preview Undangan
                </button>

                <!-- Tombol Pesan Sekarang -->
                <button 
                    onclick="openOrderModal('${inv.title}')" 
                    style="
                        background-color:#1e90ff; 
                        color:white; 
                        border:none; 
                        padding:8px 14px; 
                        border-radius:6px; 
                        cursor:pointer;
                    ">
                    Pesan Sekarang
                </button>
            </div>
        `;
    }).join('');

}

// ===============================
// ORDER MODAL
// ===============================
function openOrderModal(theme) {
    document.getElementById('orderTheme').value = theme;
    document.getElementById('orderModal').classList.add('active');
}

function closeOrderModal() {
    document.getElementById('orderModal').classList.remove('active');
}

// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', async () => {

    if (!window.supabaseClient) {
        console.error("Supabase belum terinisialisasi!");
        return;
    }

    await renderFilters();
    await renderInvitations();

    const orderForm = document.getElementById('orderForm');

    orderForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const theme = document.getElementById('orderTheme').value;
        const name = document.getElementById('orderName').value;
        const phone = document.getElementById('orderPhone').value;
        const date = document.getElementById('orderDate').value;
        const quantity = document.getElementById('orderQuantity').value;

        const message = `
Halo Admin 👋

Saya ingin memesan undangan digital:

Tema: ${theme}
Nama: ${name}
No HP: ${phone}
Tanggal Acara: ${date}
Jumlah Undangan: ${quantity}

Terima kasih 🙏
        `;

        const encodedMessage = encodeURIComponent(message);

        window.open(
            `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`,
            '_blank'
        );

        closeOrderModal();
    });
});
