import { useState, useEffect, useRef } from 'react';
import { UserService, type UserSearchResult } from '../services/userService';

interface UserAutocompleteProps {
  onUserSelect: (user: UserSearchResult | null) => void;
  selectedUser: UserSearchResult | null;
  placeholder?: string;
}

export function UserAutocomplete({ onUserSelect, selectedUser, placeholder = "Buscar usuario por email..." }: UserAutocompleteProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const searchTimeoutRef = useRef<number | undefined>(undefined);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selectedUser) {
      setSearchTerm(selectedUser.email);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (searchTimeoutRef.current !== undefined) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length < 1) {
      setSearchResults([]);
      setIsOpen(false);
      return;
    }

    searchTimeoutRef.current = window.setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        let result;
        
        console.log('🔍 UserAutocomplete: Buscando usuarios con término:', searchTerm);
        
        // Si el término de búsqueda es muy corto, obtener todos los usuarios y filtrar localmente
        if (searchTerm.length < 3) {
          console.log('📋 UserAutocomplete: Obteniendo todos los usuarios...');
          result = await UserService.getAllUsers();
          console.log('📋 UserAutocomplete: Resultado getAllUsers:', result);
          
          if (result.success && result.data) {
            console.log('📋 UserAutocomplete: Usuarios encontrados:', result.data.length);
            result.data.forEach((user, index) => {
              console.log(`   ${index + 1}. ${user.email} (UID: ${user.uid})`);
            });
            
            // Filtrar localmente por email que contenga el término de búsqueda
            const filteredUsers = result.data.filter(user => 
              user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
            console.log('🔍 UserAutocomplete: Usuarios filtrados:', filteredUsers.length);
            filteredUsers.forEach((user, index) => {
              console.log(`   ${index + 1}. ${user.email}`);
            });
            
            setSearchResults(filteredUsers);
            setIsOpen(filteredUsers.length > 0);
          }
        } else {
          console.log('🔍 UserAutocomplete: Búsqueda por prefijo...');
          // Para términos más largos, usar búsqueda por prefijo en Firestore
          result = await UserService.searchUsersByEmail(searchTerm);
          console.log('🔍 UserAutocomplete: Resultado searchUsersByEmail:', result);
          
          if (result.success && result.data) {
            console.log('🔍 UserAutocomplete: Usuarios encontrados por prefijo:', result.data.length);
            result.data.forEach((user, index) => {
              console.log(`   ${index + 1}. ${user.email} (UID: ${user.uid})`);
            });
            
            setSearchResults(result.data);
            setIsOpen(result.data.length > 0);
          }
        }
        
        if (!result.success) {
          console.error('❌ UserAutocomplete: Error en búsqueda:', result.error);
          console.error('❌ UserAutocomplete: Detalles del error:', {
            success: result.success,
            error: result.error,
            data: result.data
          });
          setError(result.error || 'Error buscando usuarios');
          setSearchResults([]);
          setIsOpen(false);
        }
      } catch (err: any) {
        setError(err.message || 'Error inesperado');
        setSearchResults([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current !== undefined) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleUserSelect = (user: UserSearchResult) => {
    onUserSelect(user);
    setSearchTerm(user.email);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSearchResults([]);
    setIsOpen(false);
    onUserSelect(null);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value) {
      onUserSelect(null);
    }
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setIsOpen(true);
    }
  };

  const handleInputBlur = () => {
    // Delay to allow clicking on dropdown items
    setTimeout(() => setIsOpen(false), 150);
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="email"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
        
        {selectedUser && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
        
        {loading && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {isOpen && searchResults.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {searchResults.map((user) => (
            <div
              key={user.uid}
              onClick={() => handleUserSelect(user)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="font-medium text-gray-900">{user.email}</div>
              {user.displayName && (
                <div className="text-sm text-gray-500">{user.displayName}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {isOpen && searchResults.length === 0 && searchTerm.length >= 1 && !loading && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <div className="px-3 py-2 text-gray-500">
            No se encontraron usuarios con ese email
          </div>
          <button
            type="button"
            onClick={async () => {
              setLoading(true);
              try {
                const result = await UserService.getAllUsers();
                if (result.success && result.data) {
                  setSearchResults(result.data);
                  setIsOpen(true);
                }
              } catch (error) {
                console.error('Error cargando todos los usuarios:', error);
              } finally {
                setLoading(false);
              }
            }}
            className="w-full px-3 py-2 text-left text-sm text-blue-600 hover:bg-blue-50 border-t border-gray-100"
          >
            Ver todos los usuarios
          </button>
        </div>
      )}
    </div>
  );
}
