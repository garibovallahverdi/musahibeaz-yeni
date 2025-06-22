'use client';

import React, { useState } from 'react';
import { api } from '~/trpc/react';
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from 'react-icons/ai';
import Loading from "../_components/loading";

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [roleLoadingId, setRoleLoadingId] = useState<string | null>(null);
  const limit = 10;

  // Kullanıcıları getir
  const { data, isLoading, refetch } = api.admin.users.getUsers.useQuery({ page, limit });

  const acceptUserMutation = api.admin.users.accepUser.useMutation({
    onSuccess: () => {
      setLoadingId(null);
      void refetch();
    },
    onError: () => {
      setLoadingId(null);
    },
  });

  const setUserRoleMutation = api.admin.users.setUserRole.useMutation({
    onSuccess: () => {
      setRoleLoadingId(null);
      void refetch();
    },
    onError: () => {
      setRoleLoadingId(null);
    },
  });

  const handleAccept = async (id: string) => {
    setLoadingId(id);
    await acceptUserMutation.mutateAsync({ id });
  };

  const handleSetRole = async (id: string, role: "editor" | "redaktor") => {
    setRoleLoadingId(id);
    await setUserRoleMutation.mutateAsync({ id, role });
  };

  if (isLoading) {
    return <Loading/>;
  }

  if (!data || data.users.length === 0) {
    return <p>Kullanıcı bulunamadı.</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">İstifadəçilər</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">E-mail</th>
            <th className="border border-gray-300 p-2">Admin təsdiqi</th>
            <th className="border border-gray-300 p-2">Rol</th>
            <th className="border border-gray-300 p-2">Əməliyyatlar</th>
          </tr>
        </thead>
        <tbody>
          {data.users.map((user) => (
            <tr key={user.id} className="text-center">
              <td className="border border-gray-300 p-2">{user.email}</td>
              <td className="border border-gray-300 p-2">
                {user.adminAccept ? (
                  <AiOutlineCheckCircle className="text-green-500 text-xl inline" />
                ) : (
                  <AiOutlineCloseCircle className="text-red-500 text-xl inline" />
                )}
              </td>
              <td className="border border-gray-300 p-2">
                <select
                  value={user.role ?? "user"}
                  onChange={(e) => handleSetRole(user.id, e.target.value as "editor" | "redaktor")}
                  disabled={roleLoadingId === user.id   || !user.adminAccept}
                  className="border p-1 rounded"
                >
                  <option value="user">İstifadəçi</option>
                  <option value="editor">Editor</option>
                  <option value="redaktor">Redaktör</option>
                </select>
              </td>
              <td className="border border-gray-300 p-2 flex justify-center items-center gap-2">
                {!user.adminAccept && (
                  <>
                    {user.emailVerified ? (
                      <button
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 w-24"
                        onClick={() => handleAccept(user.id)}
                        disabled={loadingId === user.id}
                      >
                        {loadingId === user.id ? (
                          <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4"></span>
                        ) : (
                          "Təsdiqlə"
                        )}
                      </button>
                    ) : (
                      <span className="text-red-500 text-sm">Hesab aktiv deyil</span>
                    )}
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Sayfalama Kontrolleri */}
      <div className="mt-4 flex justify-between">
        <button
          disabled={page === 1}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          className="bg-gray-500 text-white px-4 py-1 rounded disabled:opacity-50"
        >
          Əvvəlki
        </button>
        <span>Səhifə {page}</span>
        <button
          disabled={data.count <= page * limit}
          onClick={() => setPage((prev) => prev + 1)}
          className="bg-gray-500 text-white px-4 py-1 rounded disabled:opacity-50"
        >
          Sonrakı
        </button>
      </div>
    </div>
  );
};

export default UsersPage;
