# SATELLITE-TRACKER

## Descripció

**SATELLITE-TRACKER** és una aplicació web interactiva que permet visualitzar la trajectòria de satèl·lits en temps real i obtenir informació detallada sobre les seves òrbites. Utilitza l'API de [N2YO](https://www.n2yo.com/) per obtenir dades com passes visuals, Two-Line Element (TLE), i altra informació rellevant.

Aquest projecte està desenvolupat amb **React** per a la interfície d'usuari i Python per a funcionalitats complementàries.

---

## Funcionalitats

- **Llistat de satèl·lits:** Consulta els satèl·lits visibles en una ubicació específica.
- **Informació de passes visuals:** Descobreix quan seran visibles des del teu punt de vista.
- **Representació de l'òrbita:** Visualitza la trajectòria del satèl·lit a l'òrbita terrestre.
- **Personalització visual:** Interfície atractiva i fàcil d'usar, amb components optimitzats.

---

## Captures de Pantalla

*(Aquí pots incloure captures de pantalla o GIFs de l'aplicació per mostrar les funcionalitats visuals.)*

---

## Tecnologies Utilitzades

- **Frontend:** React, CSS
- **API:** [N2YO API](https://www.n2yo.com/)
- **Backend:** Python (opcional per funcionalitats avançades)
- **Deployment:** (Indica si fas servir serveis com Netlify, Vercel o altres)

---

## Requisits

- **Node.js**: v14 o superior
- **NPM**: v6 o superior
- Clau d'accés per l'API de N2YO

---

## Instal·lació i Configuració

1. **Clona el repositori**:

   ```bash
   git clone https://github.com/garrigarnau/SATELLITE-TRACKER.git
   cd SATELLITE-TRACKER
   ```

2. **Instal·la les dependències**:

   ```bash
   npm install
   ```

3. **Configura la clau API**:
   - Crea un fitxer `.env` a l'arrel del projecte i afegeix la teva clau d'API:
     ```
     REACT_APP_N2YO_API_KEY=la_teva_clau
     ```

4. **Inicia l'aplicació**:

   ```bash
   npm start
   ```

   L'aplicació estarà disponible a [http://localhost:3000](http://localhost:3000).

---

## Contribució

Tothom és benvingut a contribuir! Si tens idees, correccions o millores:

1. Fes un **fork** del repositori.
2. Crea una **branch** per a la teva característica o correcció.
3. Fes un **pull request** i explica els teus canvis.

---

## Millores Futures

- Integració de mapes interactius per visualitzar satèl·lits en temps real.
- Opció per guardar preferències de l'usuari.
- Optimització del rendiment per a càrregues massives de dades.

---

## Licència

Aquest projecte està sota la llicència MIT. Consulta el fitxer [LICENSE](LICENSE) per a més detalls.

---

## Contacte

Si tens preguntes o suggeriments, no dubtis en contactar-me a través de [GitHub](https://github.com/garrigarnau).

-
