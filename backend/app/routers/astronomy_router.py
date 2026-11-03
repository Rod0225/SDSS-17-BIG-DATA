from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from backend.app.core.security import get_current_user
from backend.app.database.models import User
from backend.app.astronomical_map.sky_service import sky_service

router = APIRouter(prefix="/astronomy", tags=["Visualizador 3D del Universo"])

@router.get("/points")
def get_astronomical_points(
    mode: str = Query("celestial", description="Modo 3D: 'celestial' (Esfera celeste) o 'spatial' (Espacio cosmológico)"),
    classes: Optional[List[str]] = Query(None, description="Filtro de clases: STAR, GALAXY, QSO"),
    min_redshift: Optional[float] = Query(None, description="Redshift mínimo"),
    max_redshift: Optional[float] = Query(None, description="Redshift máximo"),
    min_ra: Optional[float] = Query(None, description="Ascensión recta mínima"),
    max_ra: Optional[float] = Query(None, description="Ascensión recta máxima"),
    min_dec: Optional[float] = Query(None, description="Declinación mínima"),
    max_dec: Optional[float] = Query(None, description="Declinación máxima"),
    limit: int = Query(15000, le=50000, description="Cantidad máxima de puntos devueltos para el BufferGeometry"),
    offset: int = Query(0, ge=0, description="Offset de paginación"),
    current_user: User = Depends(get_current_user)
):
    """Retorna coordenadas 3D de objetos reales para renderizado acelerado por GPU en Three.js."""
    return sky_service.get_points(
        mode=mode,
        classes=classes,
        min_redshift=min_redshift,
        max_redshift=max_redshift,
        min_ra=min_ra,
        max_ra=max_ra,
        min_dec=min_dec,
        max_dec=max_dec,
        limit=limit,
        offset=offset
    )

@router.get("/object/{obj_id}")
def get_object_details(
    obj_id: str,
    current_user: User = Depends(get_current_user)
):
    """Consulta los metadatos científicos completos y evaluación ML de un objeto estelar por su obj_ID."""
    detail = sky_service.get_object_detail(obj_id)
    if not detail:
        raise HTTPException(status_code=404, detail=f"Objeto astronómico con ID '{obj_id}' no encontrado.")
    return detail

