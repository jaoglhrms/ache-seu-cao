import Navbar from './components/Navbar';
import Card from './components/Card';
import { useState, useEffect } from 'react';
import { GoogleLogin, useGoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import { 
  Dog, MapPin, Search, Home, Plus, X, 
  MessageCircle, CheckCircle, AlertTriangle, LogOut, Trash2, Navigation 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';

// Correção dos ícones do Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- COLOQUE SEU EMAIL AQUI ---
const ADMIN_EMAILS = ["joaoguilhermegf@gmail.com"]; 

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
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [currentPetToMatch, setCurrentPetToMatch] = useState(null); 
  const [potentialMatches, setPotentialMatches] = useState([]); 
  const [bairroSelection, setBairroSelection] = useState('');
  
  const [formData, setFormData] = useState({
    name: '', description: '', contact: '', neighborhood: '', color: '', size: '', sex: '', date: ''
  });
  const [mapPosition, setMapPosition] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // IMPORTANTE: Mude para o link do Render quando subir, por enquanto use localhost
  // IMPORTANTE: Link do Backend no Render
const API_URL = "https://ache-seu-cao-api.onrender.com";

  const fetchPets = () => {
    const params = new URLSearchParams({ type: activeTab, ...filters });
    for (const [key, value] of params.entries()) { if (!value) params.delete(key); }
    fetch(`${API_URL}/api/pets?${params.toString()}`).then(res => res.json()).then(data => setPets(data));
  };

  useEffect(() => { fetchPets(); }, [activeTab, filters]);

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Busca os dados do usuário usando o token do Google
        const res = await fetch(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${tokenResponse.access_token}`, {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}`, Accept: 'application/json' }
        });
        const data = await res.json();
        setUser(data); // Salva o usuário no estado
      } catch (err) {
        console.error("Erro no login:", err);
      }
    },
  });
  const handleLogout = () => setUser(null);
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  const getWhatsappLink = (pet) => {
    const phone = pet.contact.replace(/\D/g, ''); 
    let text = "";
    if (pet.type === 'missing') {
        text = `Olá! Vi no PetHunt que você está PROCURANDO o pet "${pet.name}". Tenho informações sobre ele.`;
    } else {
        text = `Olá! Vi no PetHunt que você ENCONTROU um pet (${pet.color}, ${pet.neighborhood}). Acho que pode ser o meu!`;
    }
    return `https://wa.me/55${phone}?text=${encodeURIComponent(text)}`;
  };

  const openMatchModal = (pet) => {
    setCurrentPetToMatch(pet);
    const oppositeType = activeTab === 'missing' ? 'found' : 'missing';
    fetch(`${API_URL}/api/pets?type=${oppositeType}`).then(res => res.json()).then(data => {
        const available = data.filter(p => !p.linkedPostId && p.status !== 'resolved');
        setPotentialMatches(available);
        setShowMatchModal(true);
      });
  };

  const confirmMatch = async (targetId) => {
    await fetch(`${API_URL}/api/pets/${currentPetToMatch.id}/match`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetId })
    });
    setShowMatchModal(false); fetchPets(); alert("Vínculo criado!");
  };

  const handleDelete = async (id) => {
    if (confirm("Tem certeza que deseja apagar este post?")) {
        await fetch(`${API_URL}/api/pets/${id}`, { method: 'DELETE' });
        fetchPets();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (mapPosition) { data.append('lat', mapPosition.lat); data.append('lng', mapPosition.lng); }
    data.append('ownerName', user.name); data.append('ownerEmail', user.email);
    data.append('type', activeTab); 
    if (imageFile) data.append('image', imageFile);

    await fetch(`${API_URL}/api/pets`, { method: 'POST', body: data });
    
    setFormData({ name: '', description: '', contact: '', neighborhood: '', color: '', size: '', sex: '', date: '' });
    setImageFile(null); setBairroSelection(''); setMapPosition(null); setShowForm(false); fetchPets(); 
  };

  const markAsResolved = async (id) => {
    await fetch(`${API_URL}/api/pets/${id}/resolve`, { method: 'PATCH' }); fetchPets();
  };

  return (
    <div className="app-container">

      
      {/* --- AQUI ENTRA O NOVO NAVBAR --- */}
      {/* Ele substitui todo o antigo <header> */}
      <Navbar 
        user={user} 
        onLogin={() => login()} 
        onLogout={handleLogout} 
        onOpenForm={() => setShowForm(true)}
      />
      {/* ------------------------------- */}

      <div className="controls-wrapper">

      <div className="controls-wrapper">
        <div className="tabs-pills">
            <button className={`tab-btn ${activeTab === 'missing' ? 'active missing' : ''}`} onClick={() => setActiveTab('missing')}><Search size={18} /> Procurando</button>
            <button className={`tab-btn ${activeTab === 'found' ? 'active found' : ''}`} onClick={() => setActiveTab('found')}><Home size={18} /> Encontrei</button>
        </div>
        <div className="filters-container">
            <div className="scroll-filters">
                <select onChange={e => setFilters({...filters, neighborhood: e.target.value})}><option value="">Todos Bairros</option>{BAIRROS_PVH.map(b => <option key={b} value={b}>{b}</option>)}</select>
                <select onChange={e => setFilters({...filters, sex: e.target.value})}><option value="">Sexo</option><option value="Macho">Macho</option><option value="Femea">Fêmea</option></select>
            </div>
        </div>
      </div>

      {user && (
        <button className={`fab-btn ${showForm ? 'close' : ''}`} onClick={() => setShowForm(!showForm)}>
          {showForm ? <X size={24} /> : <Plus size={24} />}
        </button>
      )}

      {showForm && user && (
        <div className="form-overlay">
            <form className="form-card animate-up" onSubmit={handleSubmit}>
            <div className="form-header"><h3>{activeTab === 'missing' ? 'Desaparecido' : 'Encontrado'}</h3><button type="button" onClick={() => setShowForm(false)}><X size={20}/></button></div>
            
            <div className="map-section">
                <label>📍 Onde foi visto? (Clique no mapa)</label>
                <div className="map-wrapper">
                    <MapContainer center={[-8.7619, -63.9039]} zoom={13} style={{ height: "100%", width: "100%" }}>
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        <LocationMarker position={mapPosition} setPosition={setMapPosition} />
                    </MapContainer>
                </div>
            </div>

            <div className="input-group">
                <input placeholder="Nome do Pet" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
            </div>

            <div className="input-group column">
                <select value={bairroSelection} onChange={(e) => { const val = e.target.value; setBairroSelection(val); val === 'Outro' ? setFormData({...formData, neighborhood: ''}) : setFormData({...formData, neighborhood: val}); }} required>
                    <option value="">Selecione o Bairro</option>{BAIRROS_PVH.map(b => <option key={b} value={b}>{b}</option>)}<option value="Outro">Outro</option>
                </select>
                {bairroSelection === 'Outro' && <input placeholder="Digite o bairro..." value={formData.neighborhood} onChange={e => setFormData({...formData, neighborhood: e.target.value})} required className="input-highlight"/>}
            </div>

            <div className="input-group">
                <select value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} required><option value="">Porte</option><option value="Pequeno">P</option><option value="Medio">M</option><option value="Grande">G</option></select>
                <select value={formData.sex} onChange={e => setFormData({...formData, sex: e.target.value})} required><option value="">Sexo</option><option value="Macho">M</option><option value="Femea">F</option></select>
            </div>
            
            <input placeholder="Cor" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} required />
            <label className="file-upload"><span>📸 Escolher Foto</span><input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} required /></label>
            <textarea rows="2" placeholder="Descrição..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
            <input placeholder="WhatsApp" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} required />
            <button type="submit" className="btn-submit">Publicar</button>
            </form>
        </div>
      )}

      {showMatchModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-pop">
            <div className="modal-header"><h3>Vincular Pet</h3><button onClick={() => setShowMatchModal(false)}><X size={20}/></button></div>
            <div className="match-list">
                {potentialMatches.map(match => (
                    <div key={match.id} className="match-item" onClick={() => confirmMatch(match.id)}>
                        <img src={match.imageUrl} alt="" />
                        <div className="match-info"><strong>{match.name}</strong><span>{match.neighborhood}</span></div>
                    </div>
                ))}
            </div>
          </div>
        </div>
      )}

      <div className="content-area">
    <div className="content-area">
  </div>
</div>
  
  {/* Novo Grid do Tailwind (Responsivo: 1 coluna no celular, 2 ou 3 no PC) */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
    
    {/* Caso não tenha pets (Estado Vazio) */}
    {pets.length === 0 && (
      <div className="col-span-full flex flex-col items-center justify-center text-gray-500 py-12">
        <Dog size={64} className="text-gray-300 mb-4" />
        <p className="text-lg font-medium">Nenhum pet encontrado nesta região.</p>
      </div>
    )}

    {/* Lista de Pets usando o novo Card */}
    {pets.map((pet) => (
      <Card 
        key={pet.id || pet._id} 
        name={pet.name}
        description={pet.description}
        imageUrl={pet.imageUrl}
        date={pet.date || pet.createdAt}
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