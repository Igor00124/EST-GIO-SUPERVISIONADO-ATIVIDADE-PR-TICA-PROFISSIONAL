//<script>
class InventorySystem {
  constructor() {
    this.products = JSON.parse(localStorage.getItem('products')) || [];
    this.init();
  }

  init() {
    this.renderProducts();
    this.updateDashboard();
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.getElementById('productForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.addProduct();
    });
    document.getElementById('editForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveEdit();
    });
    document.getElementById('sortBy').addEventListener('change', () => this.renderProducts());
    document.getElementById('categoryFilter').addEventListener('change', () => this.renderProducts());
    document.getElementById('searchInput').addEventListener('input', () => this.renderProducts());
  }

  addProduct() {
    const product = {
      id: Date.now(),
      name: document.getElementById('productName').value,
      category: document.getElementById('productCategory').value,
      quantity: parseInt(document.getElementById('productQuantity').value),
      price: parseFloat(document.getElementById('productPrice').value),
      minStock: parseInt(document.getElementById('minStock').value),
      description: document.getElementById('productDescription').value,
      supplier: document.getElementById('supplier').value,
      lastUpdated: new Date().toISOString()
    };

    this.products.push(product);
    this.saveProducts();
    this.renderProducts();
    this.updateDashboard();
    this.showNotification('Produto adicionado com sucesso!');
    document.getElementById('productForm').reset();
  }

  removeProduct(id) {
    if (confirm('Tem certeza que deseja remover este produto?')) {
      this.products = this.products.filter(product => product.id !== id);
      this.saveProducts();
      this.renderProducts();
      this.updateDashboard();
      this.showNotification('Produto removido com sucesso!');
    }
  }

  editProduct(id) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      document.getElementById('editId').value = product.id;
      document.getElementById('editName').value = product.name;
      document.getElementById('editCategory').value = product.category;
      document.getElementById('editQuantity').value = product.quantity;
      document.getElementById('editPrice').value = product.price;
      document.getElementById('editMinStock').value = product.minStock;
      document.getElementById('editDescription').value = product.description;
      document.getElementById('editSupplier').value = product.supplier;
      document.getElementById('editModal').style.display = 'flex';
    }
  }

  saveEdit() {
    const id = parseInt(document.getElementById('editId').value);
    const productIndex = this.products.findIndex(p => p.id === id);

    if (productIndex !== -1) {
      this.products[productIndex] = {
        ...this.products[productIndex],
        name: document.getElementById('editName').value,
        category: document.getElementById('editCategory').value,
        quantity: parseInt(document.getElementById('editQuantity').value),
        price: parseFloat(document.getElementById('editPrice').value),
        minStock: parseInt(document.getElementById('editMinStock').value),
        description: document.getElementById('editDescription').value,
        supplier: document.getElementById('editSupplier').value,
        lastUpdated: new Date().toISOString()
      };
      this.saveProducts();
      this.renderProducts();
      this.updateDashboard();
      this.showNotification('Produto atualizado com sucesso!');
      closeModal();
    }
  }

  updateQuantity(id, change) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      product.quantity += change;
      if (product.quantity < 0) product.quantity = 0;
      product.lastUpdated = new Date().toISOString();
      this.saveProducts();
      this.renderProducts();
      this.updateDashboard();
    }
  }

  saveProducts() {
    localStorage.setItem('products', JSON.stringify(this.products));
  }

  renderProducts() {
    const productList = document.getElementById('productList');
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const sortBy = document.getElementById('sortBy').value;
    let filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(searchQuery) &&
      (categoryFilter === '' || product.category === categoryFilter)
    );
    
    filteredProducts.sort((a, b) => {
      switch (sortBy) {
        case 'price': return a.price - b.price;
        case 'quantity': return a.quantity - b.quantity;
        default: return a.name.localeCompare(b.name);
      }
    });

    productList.innerHTML = '';
    filteredProducts.forEach(product => {
      const stockStatus = product.quantity <= product.minStock ?
        (product.quantity === 0 ? 'stock-low' : 'stock-warning') : 'stock-ok';

      const productElement = document.createElement('div');
      productElement.className = 'product-item';
      productElement.innerHTML = `
        <div class="product-header">
          <h3>${product.name}</h3>
          <div>
            <button onclick="inventory.editProduct(${product.id})" class="btn-warning">Editar</button>
            <button onclick="inventory.removeProduct(${product.id})" class="btn-danger">Remover</button>
          </div>
        </div>
        <div class="product-details">
          <div>
            <strong>Categoria:</strong> ${product.category}<br>
            <strong>Fornecedor:</strong> ${product.supplier || 'Não informado'}<br>
            <strong>Última Atualização:</strong> ${new Date(product.lastUpdated).toLocaleDateString()}
          </div>
          <div>
            <strong>Preço:</strong> R$ ${product.price.toFixed(2)}<br>
            <strong>Estoque:</strong> <span class="${stockStatus}">${product.quantity}</span><br>
            <strong>Estoque Mínimo:</strong> ${product.minStock}
          </div>
          <div>
            <strong>Descrição:</strong><br>
            ${product.description || 'Sem descrição'}
          </div>
          <div>
            <button onclick="inventory.updateQuantity(${product.id}, -1)" class="btn-warning">-</button>
            <button onclick="inventory.updateQuantity(${product.id}, 1)" class="btn-success">+</button>
          </div>
        </div>
      `;
      productList.appendChild(productElement);
    });
  }

  updateDashboard() {
    const totalProducts = this.products.length;
    const totalValue = this.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
    const lowStock = this.products.filter(product => product.quantity <= product.minStock).length;
    const categories = new Set(this.products.map(product => product.category)).size;
    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('totalValue').textContent = `R$ ${totalValue.toFixed(2)}`;
    document.getElementById('lowStock').textContent = lowStock;
    document.getElementById('totalCategories').textContent = categories;
  }

  showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.style.display = 'block';
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }

  search() {
    this.renderProducts();
  }
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

const inventory = new InventorySystem();

// Close modal when clicking outside
window.onclick = function(event) {
  const modal = document.getElementById('editModal');
  if (event.target === modal) {
    closeModal();
  }
}
