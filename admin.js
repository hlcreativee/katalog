// ============================
// AUTH CHECK
// ============================

if (window.location.pathname.includes('admin-dashboard.html')) {
    if (localStorage.getItem('isAdminLoggedIn') !== 'true') {
        window.location.href = 'admin-login.html';
    }
}

// ============================
// SUPABASE FUNCTIONS
// ============================

async function getCategories() {
    const { data, error } = await supabaseClient
        .from('categories')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return [];
    }

    return data || [];
}

async function getInvitations() {
    const { data, error } = await supabaseClient
        .from('invitations')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        return [];
    }

    return data || [];
}

// ============================
// RENDER
// ============================

async function renderCategories() {
    const categories = await getCategories();
    const list = document.getElementById('categories-list');
    if (!list) return;

    list.innerHTML = categories.map(category => `
        <div class="admin-card">
            <h3>${category.name}</h3>
            <p>Slug: ${category.slug}</p>
            <div class="admin-card-actions">
                <button onclick="deleteCategory('${category.id}')">Hapus</button>
            </div>
        </div>
    `).join('');
}

async function renderInvitations() {
    const categories = await getCategories();
    const invitations = await getInvitations();
    const list = document.getElementById('invitations-list');
    if (!list) return;

    list.innerHTML = invitations.map(inv => {
        const category = categories.find(c => c.id === inv.category_id);

        return `
            <div class="admin-card">
                <img src="${inv.image_url}" class="admin-card-image">
                <h3>${inv.title}</h3>
                <p>${category ? category.name : ''}</p>
                <p>Rp ${Number(inv.price).toLocaleString('id-ID')}</p>

                <button 
                    onclick="window.open('${inv.demo_url}', '_blank')"
                    style="background-color:black; color:white; border:none; padding:8px 14px; border-radius:6px; cursor:pointer; margin-right:8px;">
                    Preview Undangan
                </button>

                <button 
                    onclick="deleteInvitation('${inv.id}')"
                    style="background-color:red; color:white; border:none; padding:8px 14px; border-radius:6px; cursor:pointer;">
                    Hapus
                </button>
            </div>
        `;
    }).join('');

}

// ============================
// CATEGORY CRUD
// ============================

async function createCategory(name, slug) {
    const { error } = await supabaseClient
        .from('categories')
        .insert([{ name, slug }]);

    if (error) console.error(error);
}

window.deleteCategory = async function(id) {
    if (!confirm('Yakin hapus kategori?')) return;

    await supabaseClient
        .from('categories')
        .delete()
        .eq('id', id);

    renderCategories();
    showToast('Kategori berhasil dihapus');
};

// ============================
// INVITATION CRUD
// ============================

async function createInvitation(data) {
    const { error } = await supabaseClient
        .from('invitations')
        .insert([data]);

    if (error) console.error(error);
}

window.deleteInvitation = async function(id) {
    if (!confirm('Yakin hapus undangan?')) return;

    await supabaseClient
        .from('invitations')
        .delete()
        .eq('id', id);

    renderInvitations();
    showToast('Undangan berhasil dihapus');
};

// ============================
// FORM HANDLER
// ============================

document.addEventListener('DOMContentLoaded', () => {

    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('categoryName').value;
            const slug = document.getElementById('categorySlug').value;

            await createCategory(name, slug);
            renderCategories();
            categoryForm.reset();
            showToast('Kategori berhasil ditambahkan');
        });
    }

    const invitationForm = document.getElementById('invitationForm');
    if (invitationForm) {
        invitationForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const data = {
                title: document.getElementById('invitationTitle').value,
                description: document.getElementById('invitationDescription').value,
                image_url: document.getElementById('invitationImage').value,
                demo_url: document.getElementById('invitationDemo').value,
                price: parseInt(document.getElementById('invitationPrice').value),
                category_id: document.getElementById('invitationCategory').value
            };

            await createInvitation(data);
            renderInvitations();
            invitationForm.reset();
            showToast('Undangan berhasil ditambahkan');
        });
    }

    if (window.location.pathname.includes('admin-dashboard.html')) {
        renderCategories();
        renderInvitations();
    }
});

// ============================
// TOAST
// ============================

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.className = 'toast show';

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}
// ============================
// MODAL CONTROL
// ============================

window.openInvitationModal = async function () {
    await loadCategoryDropdown(); // 🔥 ini yang kurang
    document.getElementById('invitationModal').classList.add('active');
};

window.closeInvitationModal = function () {
    document.getElementById('invitationModal').classList.remove('active');
};

window.openCategoryModal = function () {
    document.getElementById('categoryModal').classList.add('active');
};

window.closeCategoryModal = function () {
    document.getElementById('categoryModal').classList.remove('active');
};
// ============================
// LOAD CATEGORY DROPDOWN
// ============================

async function loadCategoryDropdown() {
    const select = document.getElementById('invitationCategory');
    if (!select) return;

    const categories = await getCategories();

    console.log("DATA CATEGORIES:", categories); // 🔥 TAMBAHKAN INI

    select.innerHTML = '<option value="">Pilih kategori</option>';

    categories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat.id;
        option.textContent = cat.name;
        select.appendChild(option);
    });
}
