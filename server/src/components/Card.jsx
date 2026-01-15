import React from 'react';

// Função auxiliar para formatar data
const formatDate = (dateString) => {
  if (!dateString) return 'Data não informada';
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('pt-BR', options);
};

const Card = ({ name, description, date, imageUrl, contact, location }) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col h-full">
      
      {/* FOTO DO PET */}
      <div className="relative h-56 overflow-hidden group">
        <img 
          src={imageUrl} 
          alt={name} 
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow-sm">
          Perdido
        </div>
      </div>

      {/* INFORMAÇÕES */}
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h2 className="text-xl font-bold text-gray-800 line-clamp-1 capitalize">{name}</h2>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <span className="bg-gray-100 px-2 py-1 rounded mr-2">📍 {location || 'Porto Velho'}</span>
          <span>📅 {formatDate(date)}</span>
        </div>

        <p className="text-gray-600 text-sm mb-5 line-clamp-3 flex-grow">
          {description}
        </p>

        {/* BOTÃO WHATSAPP */}
        <a 
          href={`https://wa.me/55${contact}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-auto w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0012.04 2z"/>
          </svg>
          Entrar em Contato
        </a>
      </div>
    </div>
  );
};

export default Card;