import { getUserProfile } from "@/lib/auth"
import { createServerClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

export default async function EmployeeSchedulePage() {
  const profile = await getUserProfile()

  // Redirect if not authenticated or not an employee
  if (!profile) {
    redirect("/auth/login")
  }

  if (profile.role !== "employee") {
    redirect("/hr/dashboard")
  }

  const supabase = createServerClient()

  // Get current week dates
  const now = new Date()
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
  const endOfWeek = new Date(now.setDate(startOfWeek.getDate() + 6))

  // Mock schedule data (in a real app, this would come from the database)
  const scheduleEvents = [
    {
      id: 1,
      title: "Team Stand-up",
      description: "Daily team synchronization meeting",
      start_time: "09:00",
      end_time: "09:30",
      date: new Date().toISOString().split('T')[0],
      type: "meeting",
      location: "Conference Room A",
      attendees: ["John Doe", "Jane Smith", "Mike Johnson"]
    },
    {
      id: 2,
      title: "Project Review",
      description: "Quarterly project review with stakeholders",
      start_time: "14:00",
      end_time: "15:30",
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
      type: "meeting",
      location: "Virtual",
      attendees: ["Sarah Wilson", "Tom Brown"]
    },
    {
      id: 3,
      title: "Training Session: React Advanced",
      description: "Advanced React concepts and best practices",
      start_time: "10:00",
      end_time: "12:00",
      date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0], // Day after tomorrow
      type: "training",
      location: "Training Room B",
      attendees: []
    },
    {
      id: 4,
      title: "One-on-One with Manager",
      description: "Monthly check-in and feedback session",
      start_time: "15:00",
      end_time: "16:00",
      date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      type: "meeting",
      location: "Manager's Office",
      attendees: ["Manager Name"]
    }
  ]

  // Group events by date
  const eventsByDate = scheduleEvents.reduce((acc, event) => {
    if (!acc[event.date]) {
      acc[event.date] = []
    }
    acc[event.date].push(event)
    return acc
  }, {} as Record<string, typeof scheduleEvents>)

  // Generate week days
  const weekDays = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    weekDays.push(date)
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "training":
        return "bg-green-100 text-green-800 border-green-200"
      case "personal":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const todayEvents = eventsByDate[new Date().toISOString().split('T')[0]] || []
  const upcomingEvents = scheduleEvents
    .filter(event => new Date(event.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Schedule</h1>
        <p className="text-muted-foreground">Manage your meetings, training, and events</p>
      </div>

      {/* Today's Schedule */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </CardDescription>
            </div>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {todayEvents.length > 0 ? (
            <div className="space-y-3">
              {todayEvents.map((event) => (
                <div key={event.id} className={`border rounded-lg p-4 ${getEventTypeColor(event.type)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{event.title}</h3>
                      <p className="text-sm opacity-80 mb-2">{event.description}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {event.start_time} - {event.end_time}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {event.location}
                          </div>
                        )}
                        {event.attendees.length > 0 && (
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {event.attendees.length} attendees
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {event.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events today</h3>
              <p className="text-muted-foreground mb-4">Your schedule is clear for today</p>
              <Button>Schedule an Event</Button>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Weekly View</CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium">
                    {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <Button variant="outline" size="sm">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {/* Header row */}
                {weekDays.map((day, index) => (
                  <div key={index} className="text-center p-2 border-b">
                    <div className="text-sm font-medium">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`text-lg ${day.toDateString() === new Date().toDateString() ? 'text-blue-600 font-bold' : ''}`}>
                      {day.getDate()}
                    </div>
                  </div>
                ))}

                {/* Events row */}
                {weekDays.map((day, index) => {
                  const dayKey = day.toISOString().split('T')[0]
                  const dayEvents = eventsByDate[dayKey] || []
                  
                  return (
                    <div key={index} className="min-h-[100px] p-1 border-r">
                      {dayEvents.map((event) => (
                        <div 
                          key={event.id} 
                          className={`text-xs p-1 mb-1 rounded border ${getEventTypeColor(event.type)} cursor-pointer hover:opacity-80`}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="opacity-75">{event.start_time}</div>
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upcoming Events & Quick Actions */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Next 5 scheduled events</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingEvents.length > 0 ? (
                <div className="space-y-3">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-sm">{event.title}</h4>
                        <Badge variant="outline" className="text-xs capitalize">
                          {event.type}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(event.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {event.start_time} - {event.end_time}
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming events</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Training
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Request Time Off
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Schedule Summary */}
          <Card>
            <CardHeader>
              <CardTitle>This Week Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Events</span>
                  <span className="font-semibold">{scheduleEvents.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Meetings</span>
                  <span className="font-semibold">{scheduleEvents.filter(e => e.type === 'meeting').length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Training</span>
                  <span className="font-semibold">{scheduleEvents.filter(e => e.type === 'training').length}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Busiest Day</span>
                    <span className="font-semibold text-blue-600">Today</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
