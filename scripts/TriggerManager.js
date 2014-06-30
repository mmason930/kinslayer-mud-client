function TriggerManager(client)
{
	var self = this;
	this.client = client;
	this.triggers = {};
}

TriggerManager.prototype.parseLine