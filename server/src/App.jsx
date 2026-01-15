import Navbar from './components/Navbar';
import Card from './components/Card';
import { useState, useEffect } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Dog, Search, Home, Plus, X } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// Ícones do mapa
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const BAIRROS_PVH = ["Centro", "Olaria", "Embratel", "Nova Porto Velho", "Agenor de Carvalho", "Jardim América", "Cohab", "Tancredo Neves", "Caladinho", "Floresta"];

function LocationMarker({ position, setPosition }) {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });
    return position === null ? null : <Marker position={position}></Marker>;
}

function App() {
  const [pets, setPets] = useState([]);
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('missing'); 
  const [showForm, setShowForm] = useState(false); 
  const [filters, setFilters] = useState({ neighborhood: '', size: '', sex: '' });
  
  // ESTADO SIMPLES (1 FOTO)
  const [imageFile, setImageFile] = useState(null);
  const [bairroSelection, setBairroSelection] = useState('');
  const [mapPosition, setMapPosition] = useState(null);
  const [formData, setFormData] = useState({
    name: '', description: '', contact: '', neighborhood: '', color: '', size: '', sex: '', date: ''
  });

  // Endereço seguro para Windows
 const API_URL = "https://ache-seu-cao-api.onrender.com";

  const fetchPets = () => {
    const params = new URLSearchParams({ type: activeTab, ...filters });
    for (const [key, value] of params.entries()) { if (!value) params.delete(key); }
    fetch(`${API_URL}/api/pets?${params.toString()}`)
      .then(res => res.json())
      .then(data => setPets(data))
      .catch(err => console.error("Erro ao buscar:", err));
  };

  useEffect(() => { fetchPets(); }, [activeTab, filters]);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      const res = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenResponse.access_token}`, {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}`, Accept: 'application/json' }
      });
      const data = await res.json();
      setUser(data);
    },
  });

  const handleLogout = () => setUser(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) { alert("Adicione uma foto!"); return; }

    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (mapPosition) { data.append('lat', mapPosition.lat); data.append('lng', mapPosition.lng); }
    data.append('ownerName', user.name); 
    data.append('ownerEmail', user.email);
    data.append('type', activeTab);
    
    // ENVIA COMO 'image' (SINGULAR)
    data.append('image', imageFile);

    try {
        const res = await fetch(`${API_URL}/api/pets`, { method: 'POST', body: data });
        if(res.ok) {
            setFormData({ name: '', description: '', contact: '', neighborhood: '', color: '', size: '', sex: '', date: '' });
            setImageFile(null);
            setBairroSelection(''); setMapPosition(null); setShowForm(false); fetchPets();
        } else {
            alert("Erro ao salvar.");
        }
    } catch(err) { console.error(err); }
  };

  return (
    <div className="app-container min-h-screen bg-gray-50">
      <Navbar user={user} onLogin={() => login()} onLogout={handleLogout} onOpenForm={() => setShowForm(true)} />

      <div className="bg-white border-b border-gray-200 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setActiveTab('missing')} className={`px-6 py-2 rounded-md text-sm font-semibold ${activeTab === 'missing' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500'}`}>Procurando</button>
              <button onClick={() => setActiveTab('found')} className={`px-6 py-2 rounded-md text-sm font-semibold ${activeTab === 'found' ? 'bg-white text-green-600 shadow-sm' : 'text-gray-500'}`}>Encontrei</button>
            </div>
            <div className="flex gap-3">
              <select className="bg-gray-50 border border-gray-300 text-sm rounded-lg p-2.5" onChange={e => setFilters({...filters, neighborhood: e.target.value})}>
                <option value="">Todos os Bairros</option>{BAIRROS_PVH.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
        </div>
      </div>

      {user && <button className={`fab-btn ${showForm ? 'close' : ''}`} onClick={() => setShowForm(!showForm)}>{showForm ? <X size={24} /> : <Plus size={24} />}</button>}

      {showForm && user && (
        <div className="form-overlay">
            <form className="form-card animate-up" onSubmit={handleSubmit}>
            <div className="form-header"><h3>Postar Pet</h3><button type="button" onClick={() => setShowForm(false)}><X size={20}/></button></div>
            
            <div className="map-section">
                <label>📍 Onde? (Clique no mapa)</label>
                <div className="map-wrapper">
                    <MapContainer center={[-8.7619, -63.9039]} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                    </MapContainer>
                </div>
            </div>

            <div className="input-group"><input placeholder="Nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required /></div>
            <div className="input-group column">
                <select value={bairroSelection} onChange={(e) => { const val = e.target.value; setBairroSelection(val); val === 'Outro' ? setFormData({...formData, neighborhood: ''}) : setFormData({...formData, neighborhood: val}); }} required>
                    <option value="">Bairro</option>{BAIRROS_PVH.map(b => <option key={b} value={b}>{b}</option>)}<option value="Outro">Outro</option>
                </select>
                {bairroSelection === 'Outro' && <input placeholder="Digite o bairro..." value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} required />}
            </div>
            <div className="input-group">
                <select value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} required><option value="">Porte</option><option value="Pequeno">P</option><option value="Medio">M</option><option value="Grande">G</option></select>
                <select value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})} required><option value="">Sexo</option><option value="Macho">M</option><option value="Femea">F</option></select>
            </div>
            <input placeholder="Cor" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} required />
            
            {/* UPLOAD SIMPLES */}
            <label className="file-upload p-4 border-dashed border-2 rounded text-center block mb-3 cursor-pointer">
              <span>📸 Escolher 1 Foto</span>
              <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} className="hidden" required />
              {imageFile && <div className="text-green-600 text-sm mt-1">{imageFile.name}</div>}
            </label>

            <textarea rows="2" placeholder="Descrição..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            <input placeholder="WhatsApp (só números)" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} required />
            <button type="submit" className="btn-submit">Publicar</button>
            </form>
        </div>
      )}

      <div className="content-area max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map((pet) => (
            <Card 
              key={pet.id} 
              name={pet.name} 
              description={pet.description} 
              imageUrl={pet.imageUrl} // SINGULAR
              date={pet.date} 
              contact={pet.contact} 
              location={pet.neighborhood} 
            />
          ))}
        </div>
      </div>
    </div>
  );
}
export default App;