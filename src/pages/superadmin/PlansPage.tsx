import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { plansApi } from "@/api/plans.api";
import { useForm } from "react-hook-form";
import { useState } from "react";
import toast from "@/utils/toast";

export const PlansPage = () => {
  const qc = useQueryClient();
  const { data: plans = [] } = useQuery({ queryKey: ["plans"], queryFn: plansApi.getAll });
  const createPlan = useMutation({ mutationFn: plansApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ["plans"] }); toast.success("Plan creado"); } });
  const [showForm, setShowForm] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const onSubmit = async (data: any) => { await createPlan.mutateAsync(data); reset(); setShowForm(false); };

  return (
    <div className="page">
      <div className="section-hd">
        <h1 className="page-title">📋 Planes</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary btn-sm">+ Nuevo plan</button>
      </div>
      {showForm && (
        <div className="card mb-6">
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><label className="form-label">Nombre</label><input {...register("name", { required: true })} className="form-input" /></div>
              <div><label className="form-label">Precio</label><input type="number" {...register("price", { required: true, valueAsNumber: true })} className="form-input" /></div>
              <div><label className="form-label">Duración (días)</label><input type="number" {...register("durationDays", { required: true, valueAsNumber: true })} className="form-input" /></div>
              <div className="flex items-end"><button type="submit" className="btn btn-primary w-full">Crear</button></div>
            </form>
          </div>
        </div>
      )}
      <div className="card">
        {plans.map((p) => (
          <div key={p.id} className="flex items-center justify-between px-5 py-4 border-b border-gray-100 last:border-0">
            <div>
              <div className="text-sm font-semibold text-gray-900">{p.name}</div>
              <div className="text-xs text-gray-400">{p.durationDays} días</div>
            </div>
            <div className="text-lg font-bold text-gray-800">${p.price.toLocaleString("es-AR")}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
