import { useEffect } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { FirebaseService } from '@nxtai/shared'
import { useAuthStore } from '@/stores/authStore'
import { User } from '@nxtai/shared'

const firebaseService = FirebaseService.getInstance(
  import.meta.env.VITE_APP_ENV as 'dev' | 'stg' | 'prod' || 'dev'
)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const { setUser, setLoading, logout } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseService.auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Buscar dados do usuário no Firestore
          const userDoc = await getDoc(doc(firebaseService.db, 'users', firebaseUser.uid))
          
          if (userDoc.exists()) {
            const userData = userDoc.data()
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: userData.name || firebaseUser.displayName || '',
              role: userData.role || 'viewer',
              tenantId: userData.tenantId || 'default',
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            }
            setUser(user)
          } else {
            // Usuário não existe no Firestore, fazer logout
            await signOut(firebaseService.auth)
            logout()
          }
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error)
          await signOut(firebaseService.auth)
          logout()
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [setUser, setLoading, logout])

  return <>{children}</>
}