import Header from "./components/Header.jsx";
import SideNav from "./components/SideNav.jsx";
import PokeCard from "./components/PokeCard.jsx";

import { useState } from "react";

function App() {
    const [selectedPokemon, setSelectedPokemon] = useState(0)
    const [showSideMenu, setShowSideMenu] = useState(true)

    function handleToggleMenu() {
        setShowSideMenu(!showSideMenu)
    }

    function handleCloseMenu() {
        setShowSideMenu(true)
    }

    return (
      <>
          <Header handleToggleMenu={handleToggleMenu} />
          <SideNav showSideMenu={showSideMenu} selectedPokemon={selectedPokemon} setSelectedPokemon={setSelectedPokemon} handleCloseMenu={handleCloseMenu} />
          <PokeCard selectedPokemon={selectedPokemon} />
      </>
    )
}

export default App
