import React from 'react';

const Navbar = ({ user, onLogin, onLogout, onOpenForm }) => {
  return (
    <nav className="bg-primary shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* 1. Logo e Título */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="bg-white p-1.5 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h1 className="text-white text-xl font-bold tracking-tight">Ache Seu Cão <span className="text-orange-200 text-sm font-normal">PVH</span></h1>
          </div>

          {/* 2. Botões da Direita */}
          <div className="flex items-center gap-4">
            {/* Botão de Anunciar (Só aparece se logado) */}
            {user && (
              <button 
                onClick={onOpenForm}
                className="hidden sm:flex bg-white text-primary hover:bg-orange-50 font-bold py-2 px-4 rounded-full shadow-sm transition-colors items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Anunciar Pet
              </button>
            )}

            {/* Área do Usuário */}
            {user ? (
              <div className="flex items-center gap-3">
                <img 
                  src={user.picture} 
                  alt={user.name} 
                  className="h-9 w-9 rounded-full border-2 border-white shadow-sm"
                />
                <button 
                  onClick={onLogout}
                  className="text-white text-sm hover:text-orange-100 font-medium"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button 
                onClick={onLogin} // Agora chamamos a função de login aqui
                className="text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Entrar com Google
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;