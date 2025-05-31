export function requireRole(role) {
  return (req, res, next) => {
    const user = req.user;
    if (!user || user.role !== role) {
      return res.status(403).json({ erro: 'Acesso negado' });
    }
    next();
  };
}