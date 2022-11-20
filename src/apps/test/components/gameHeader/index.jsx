import "./style.css";

export const GameHeader = () => <nav class="nav_menu">
  <div class="burger_container" id="burger">
    <i class="fa-solid fa-bars"></i>
  </div>
  <h2>App settings</h2>
  <div class="links_menu">
    <a href="#">
      <i class="fa-solid fa-chart-simple"></i>
    </a>
    <a href="#">
      <i class="fa-solid fa-diagram-project"></i>
    </a>
    <a href="#">
      <i class="fa-solid fa-gear"></i>
    </a>
  </div>
  <ul class="nav_menu_user">
    <li>
      <a href="#">ZaurTech</a>
    </li>
  </ul>
</nav>