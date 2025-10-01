import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Users as UsersIcon,
  UserPlus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar,
  Loader2,
  Search,
  MoreVertical
} from "lucide-react";
import { format } from "date-fns";

interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

interface UserFormData {
  username: string;
  email: string;
  password: string;
  role: string;
}

export default function UserManagement() {
  const { toast } = useToast();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    role: "user",
  });

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    refetchInterval: 30000,
  });

  const createMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      const res = await apiRequest("POST", "/api/users", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "User created",
        description: "New user has been added successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<UserFormData> }) => {
      const res = await apiRequest("PUT", `/api/users/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
      resetForm();
      toast({
        title: "User updated",
        description: "User information has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/users/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast({
        title: "User deleted",
        description: "User has been removed successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "user",
    });
    setSelectedUser(null);
  };

  const handleAdd = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email || "",
      password: "",
      role: user.role,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmitAdd = () => {
    if (!formData.username || !formData.password) {
      toast({
        title: "Validation error",
        description: "Username and password are required",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(formData);
  };

  const handleSubmitEdit = () => {
    if (!selectedUser) return;
    
    const updateData: Partial<UserFormData> = {
      email: formData.email,
      role: formData.role,
    };
    
    if (formData.password) {
      updateData.password = formData.password;
    }

    updateMutation.mutate({ id: selectedUser.id, data: updateData });
  };

  const filteredUsers = users?.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-primary/10 text-primary border-primary/20",
      manager: "bg-success/10 text-success border-success/20",
      user: "bg-muted text-muted-foreground border-border",
    };
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors[role as keyof typeof colors] || colors.user}`}>
        <Shield className="w-3 h-3" />
        {role}
      </span>
    );
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar isMobileOpen={isMobileSidebarOpen} setIsMobileOpen={setIsMobileSidebarOpen} />

      <main className="flex-1 overflow-y-auto">
        <header className="bg-gradient-to-r from-card to-card/80 border-b border-border/50 sticky top-0 z-10 backdrop-blur-sm bg-card/95">
          <div className="px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-foreground font-myanmar bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  User Management
                </h2>
                <p className="text-sm text-muted-foreground mt-1.5 font-myanmar">
                  အသုံးပြုသူများကို စီမံခန့်ခွဲရန်
                </p>
              </div>

              <Button onClick={handleAdd} className="font-myanmar">
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
          {/* Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Users Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              [...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <Card key={user.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground font-bold text-lg">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{user.username}</CardTitle>
                          <CardDescription className="text-xs flex items-center gap-1 mt-1">
                            <Mail className="w-3 h-3" />
                            {user.email || "No email"}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-myanmar">Role</span>
                      {getRoleBadge(user.role)}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-myanmar">Status</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.isActive
                          ? "bg-success/10 text-success border border-success/20"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${user.isActive ? "bg-success animate-pulse" : "bg-muted-foreground"}`} />
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="pt-3 border-t border-border space-y-2">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="font-myanmar">Joined: </span>
                        {format(new Date(user.createdAt), "MMM dd, yyyy")}
                      </div>
                      {user.lastLogin && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span className="font-myanmar">Last login: </span>
                          {format(new Date(user.lastLogin), "MMM dd, yyyy")}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 font-myanmar"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive font-myanmar"
                        onClick={() => handleDelete(user)}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-16">
                <UsersIcon className="w-16 h-16 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground font-myanmar mb-2">
                  No users found
                </p>
                <p className="text-sm text-muted-foreground font-myanmar">
                  {searchQuery ? "Try adjusting your search" : "Add your first user to get started"}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-myanmar">Add New User</DialogTitle>
            <DialogDescription className="font-myanmar">
              Create a new user account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="add-username" className="font-myanmar">Username *</Label>
              <Input
                id="add-username"
                placeholder="Enter username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email" className="font-myanmar">Email</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password" className="font-myanmar">Password *</Label>
              <Input
                id="add-password"
                type="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role" className="font-myanmar">Role</Label>
              <select
                id="add-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="font-myanmar"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitAdd}
              disabled={createMutation.isPending}
              className="font-myanmar"
            >
              {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-myanmar">Edit User</DialogTitle>
            <DialogDescription className="font-myanmar">
              Update user information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="font-myanmar">Username</Label>
              <Input value={formData.username} disabled />
              <p className="text-xs text-muted-foreground font-myanmar">Username cannot be changed</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email" className="font-myanmar">Email</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password" className="font-myanmar">New Password</Label>
              <Input
                id="edit-password"
                type="password"
                placeholder="Leave blank to keep current password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role" className="font-myanmar">Role</Label>
              <select
                id="edit-role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
              className="font-myanmar"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEdit}
              disabled={updateMutation.isPending}
              className="font-myanmar"
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Update User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-myanmar">Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="font-myanmar">
              This will permanently delete the user <strong>{selectedUser?.username}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-myanmar">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUser && deleteMutation.mutate(selectedUser.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-myanmar"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
                                    }
