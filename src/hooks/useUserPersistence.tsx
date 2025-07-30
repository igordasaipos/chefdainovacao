import { useState, useEffect } from "react";

interface UserData {
  nome: string;
  whatsappVotante: string;
  nomeRestauranteVotante: string;
  ehCliente: string;
}

const USER_DATA_KEY = "votar_user_data";

export const useUserPersistence = () => {
  const [userData, setUserData] = useState<UserData>({
    nome: "",
    whatsappVotante: "",
    nomeRestauranteVotante: "",
    ehCliente: "sim",
  });

  // Carrega dados do localStorage na inicialização
  useEffect(() => {
    const savedData = localStorage.getItem(USER_DATA_KEY);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setUserData(parsedData);
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      }
    }
  }, []);

  // Salva dados no localStorage
  const saveUserData = (data: Partial<UserData>) => {
    const newData = { ...userData, ...data };
    setUserData(newData);
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(newData));
  };

  // Limpa dados do localStorage
  const clearUserData = () => {
    const defaultData = {
      nome: "",
      whatsappVotante: "",
      nomeRestauranteVotante: "",
      ehCliente: "sim",
    };
    setUserData(defaultData);
    localStorage.removeItem(USER_DATA_KEY);
  };

  return {
    userData,
    saveUserData,
    clearUserData,
  };
};