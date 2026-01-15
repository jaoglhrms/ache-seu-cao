import React from 'react';
import { Share2, MapPin, Calendar } from 'lucide-react';

const Card = ({ name, description, date, imageUrl, contact, location }) => {
  const handleShare = () => {
    if (navigator.share) navigator.share({ title: `Ajude ${name}`, url: window.location.href });
    else alert("Link copiado!");
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col h-full">
      <div className="h-56 relative">
        <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold capitalize">{name}</h3>
          <button onClick={handleShare} className="text-gray-400"><Share2 size={18}/></button>
        </div>
        <div className="flex gap-3 text-sm text-gray-500 mb-3">
            <span className="flex items-center gap-1"><MapPin size={14}/> {location}</span>
            <span className="flex items-center gap-1"><Calendar size={14}/> {date}</span>
        </div>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{description}</p>
        
        {/* BOTÃO CORRIGIDO */}
        <a 
          href={`https://wa.me/55${contact}`} 
          target="_blank" 
          className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-2 rounded-lg font-bold transition-colors mt-auto"
        >
          Entrar em Contato
        </a>

      </div>
    </div>
  );
};
export default Card;