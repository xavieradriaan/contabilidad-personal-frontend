export default {
  data() {
    return {
      navigationBar: null
    }
  },
  mounted() {
    this.setupNavigationBar();
  },
  beforeDestroy() {
    this.cleanupNavigationBar();
  },
  methods: {
    setupNavigationBar() {
      // Destruir cualquier instancia previa
      if (window.activeNavigationBar) {
        window.activeNavigationBar.hide();
        window.activeNavigationBar.$destroy();
      }
      
      // Crear nueva instancia
      const NavigationBar = this.$options.components.NavigationBar;
      this.navigationBar = new NavigationBar({
        propsData: {
          showLogout: true,
          showHome: false
        }
      });
      
      this.navigationBar.$mount();
      document.body.appendChild(this.navigationBar.$el);
      
      // Registrar globalmente
      window.activeNavigationBar = this.navigationBar;
    },
    cleanupNavigationBar() {
      if (this.navigationBar) {
        this.navigationBar.hide();
        setTimeout(() => {
          if (this.navigationBar.$el && this.navigationBar.$el.parentNode) {
            this.navigationBar.$el.parentNode.removeChild(this.navigationBar.$el);
          }
          this.navigationBar.$destroy();
        }, 100);
      }
    }
  }
}