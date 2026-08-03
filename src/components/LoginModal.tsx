import React, { useState } from 'react';
import { UserSession } from '../types';
import { requestAuthToken } from '../services/api';
import { User, Shield, CheckCircle2, X, Lock, Key } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (session: UserSession) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin }) => {
  const [inputUsername, setInputUsername] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showStaffAccess, setShowStaffAccess] = useState(false);
  const [staffPass, setStaffPass] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = inputUsername.trim();
    if (!cleaned) {
      setError('Por favor, informe seu Nick do Discord.');
      return;
    }

    setIsLoading(true);
    try {
      const session = await requestAuthToken(cleaned);
      onLogin(session);
      onClose();
    } catch {
      setError('Erro ao gerar token de autenticação.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStaffLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = staffPass.trim();
    if (!val) return;

    if (val.toLowerCase() === 'bakai_shuziro978' || val.toLowerCase() === 'staff' || val.toLowerCase() === 'admin') {
      setIsLoading(true);
      try {
        const nick = val.toLowerCase() === 'bakai_shuziro978' ? 'bakai_shuziro978' : val;
        const session = await requestAuthToken(nick);
        onLogin({
          ...session,
          isAdmin: true,
        });
        onClose();
      } catch {
        setError('Erro ao autenticar chave da Staff.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Credencial de Staff não reconhecida.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-lg p-1 text-zinc-400 hover:bg-zinc-900 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-red-500">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Identificação Discord</h3>
            <p className="text-xs text-zinc-400">Informe seu usuário do Discord para continuar</p>
          </div>
        </div>

        {!showStaffAccess ? (
          /* Candidate Standard Login */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Seu Nick do Discord
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-zinc-500 font-mono font-bold">@</span>
                <input
                  type="text"
                  value={inputUsername}
                  onChange={(e) => {
                    setInputUsername(e.target.value);
                    setError('');
                  }}
                  placeholder="seu_usuario_discord"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 pl-8 pr-4 text-sm text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none font-mono"
                  autoFocus
                />
              </div>
              {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white hover:bg-red-500 transition flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Confirmar e Continuar</span>
            </button>

            <div className="pt-3 text-center border-t border-zinc-900">
              <button
                type="button"
                onClick={() => setShowStaffAccess(true)}
                className="inline-flex items-center space-x-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition"
              >
                <Lock className="h-3 w-3" />
                <span>Acesso do Administrador / Staff</span>
              </button>
            </div>
          </form>
        ) : (
          /* Discreet Staff Access */
          <form onSubmit={handleStaffLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5 uppercase tracking-wider">
                Nick ou Chave de Acesso da Staff
              </label>
              <input
                type="password"
                value={staffPass}
                onChange={(e) => {
                  setStaffPass(e.target.value);
                  setError('');
                }}
                placeholder="Insira seu nick autorizador..."
                className="w-full rounded-xl border border-zinc-800 bg-zinc-900 py-2.5 px-3.5 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none font-mono"
                autoFocus
              />
              {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-zinc-800 border border-zinc-700 py-2.5 text-xs font-bold text-white hover:bg-zinc-700 transition flex items-center justify-center space-x-2"
            >
              <Shield className="h-4 w-4 text-red-400" />
              <span>Entrar no Painel de Avaliação</span>
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => setShowStaffAccess(false)}
                className="text-xs text-zinc-500 hover:text-zinc-300 underline"
              >
                Voltar para identificação de candidato
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
