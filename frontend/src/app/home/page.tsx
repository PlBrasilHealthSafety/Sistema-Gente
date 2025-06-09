export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#00A298]/10 to-[#1D3C44]/10 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <div className="text-4xl font-bold text-[#1D3C44] mb-2">
            <span className="text-[#00A298]">plbrasil</span> Health&Safety
          </div>
          <div className="text-lg text-gray-600">Sistema de Gestão de Pessoas</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h1 className="text-2xl font-bold text-[#1D3C44] mb-4">
            Bem-vindo ao Sistema!
          </h1>
          <p className="text-gray-600 mb-6">
            Esta é a página inicial do sistema. Em breve, aqui será desenvolvido o dashboard principal com todas as funcionalidades do sistema de gestão de pessoas.
          </p>
          <div className="text-sm text-gray-500">
            🚧 Em desenvolvimento...
          </div>
        </div>
      </div>
    </div>
  );
} 