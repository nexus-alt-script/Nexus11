function chat()
b = gg.choice({"📝 Show All", "📤 Send a Message"}, nil, "World Chat (Nexus) 🗓️ "..os.date())
if b == 1 then
x = gg.makeRequest("https://nexus11.onrender.com/worldchat?show=true").content
if not x then gg.alert("Something went wrong.") end
function parse(json_string)
    local result = {}
    -- Remove the outer brackets
    local content = string.match(json_string, '%[(.*)%]')
    -- Pattern to match each JSON object
    for name, message in string.gmatch(content, '{"name":"(.-)","message":"(.-)"}') do
        table.insert(result, {name = name, message = message})
    end
    return result
 end
local parsed = parse(x)
local output = ""
for i, entry in ipairs(parsed) do
    output = output .. entry.name ..": "..entry.message.."\n\n"
end
b = gg.alert(output, "Back.")
if b == 1 then
main()
end
else
b = gg.prompt({"Name: ", "Message: "}, nil, {"text", "text"})
if b == nil then end
x = gg.makeRequest("https://nexus11.onrender.com/worldchat?name="..b[1].."&message="..b[2])
gg.alert("Sent Successful!")
end
end
while true do if gg.isVisible(true) then gg.setVisible(false) chat() end end