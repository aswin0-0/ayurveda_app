
import { Menu, Bell, User } from "lucide-react"

interface TopNavProps {
  onMenuClick?: () => void
}

export function TopNav({ onMenuClick }: TopNavProps) {

  return (
    <div className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Left: Menu Button */}
        <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg hover:bg-muted transition">
          <Menu size={20} />
        </button>

        {/* Center: Nothing or Title */}
        <div className="hidden md:block flex-1" />

        {/* Right: Icons */}
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-lg hover:bg-muted transition relative">
            <Bell size={20} className="text-muted-foreground" />
            <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary" />
          </button>

          <button className="p-2 rounded-lg hover:bg-muted transition">
            <User size={20} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  )
}
